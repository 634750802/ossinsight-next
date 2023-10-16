import {DataService} from "@ossinsight/data-api";
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
}

export const templateSQL = `
WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), prs_with_opened_at AS (
    SELECT
        repo_id,
        number,
        actor_login AS opened_by,
        created_at AS opened_at
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
), prs_with_first_response_at AS (
    SELECT
        repo_id,
        number,
        responsed_by AS first_responsed_by,
        responsed_at AS first_responsed_at
    FROM (
        SELECT
            repo_id,
            number,
            actor_login AS responsed_by,
            created_at AS responsed_at,
            ROW_NUMBER() OVER (PARTITION BY repo_id, number ORDER BY created_at) AS times
        FROM github_events ge
        WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            -- Events that are considered as first response.
            AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssueCommentEvent')
            AND ge.action IN ('closed', 'created')
            {% if excludeBots %}
            -- Exclude bot users.
            AND ge.actor_login NOT LIKE '%bot%'
            {% endif %}
            {% case period %}
                {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 7 DAY)
                {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 28 DAY)
                {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 90 DAY)
                {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 12 MONTH)
            {% endcase %}
    ) sub
    WHERE
        -- Keep only the first response.
        times = 1
), tdiff AS (
    SELECT
        pwo.repo_id,
        TIMESTAMPDIFF(SECOND, pwo.opened_at, pwr.first_responsed_at) / 3600 AS hours,
        PERCENT_RANK() OVER (PARTITION BY pwo.repo_id ORDER BY (pwr.first_responsed_at - pwo.opened_at)) AS percentile
    FROM prs_with_opened_at pwo
    JOIN prs_with_first_response_at pwr USING (repo_id, number)
    WHERE
        pwr.first_responsed_at > pwo.opened_at
        -- Exclude self-response.
        AND pwr.first_responsed_by != pwo.opened_by
), tdiff_percentiles AS (
    SELECT
        repo_id,
        MAX(CASE WHEN percentile <= 0 THEN hours END) AS p0,
        MAX(CASE WHEN percentile <= 0.25 THEN hours END) AS p25,
        MAX(CASE WHEN percentile <= 0.5 THEN hours END) AS p50,
        MAX(CASE WHEN percentile <= 0.75 THEN hours END) AS p75,
        MAX(CASE WHEN percentile <= 1 THEN hours END) AS p100
    FROM tdiff
    GROUP BY repo_id
)
SELECT
    r.repo_id,
    r.repo_name,
    p0,
    p25,
    p50,
    p75,
    p100
FROM repos r
JOIN tdiff_percentiles tp USING (repo_id)
ORDER BY p50
LIMIT 50
;

`

export const endpointConfig = {
    "cacheHours": 1,
    "engine": "liquid",
    "cacheProvider": "NORMAL_TABLE",
    "params": [
        {
            "name": "ownerId",
            "replaces": "11855343",
            "type": "integer"
        },
        {
            "name": "repoIds",
            "replaces": "41986369",
            "type": "array",
            "default": [],
            "itemType": "integer",
            "maxArrayLength": 50
        },
        {
            "name": "period",
            "type": "string",
            "enums": [
                "past_7_days",
                "past_28_days",
                "past_90_days",
                "past_12_months"
            ],
            "default": "past_28_days"
        },
        {
            "name": "excludeBots",
            "type": "boolean",
            "default": true
        }
    ]
}

const dataService = new DataService({
  url: process.env.DATABASE_URL
});

export async function GET(req: NextRequest) {
  const result = await dataService.handleQueryEndpoint(req, templateSQL, endpointConfig);
  return NextResponse.json(result);
}
