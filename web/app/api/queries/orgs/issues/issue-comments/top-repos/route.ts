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
), opened_issues AS (
    SELECT
        ge.repo_id, number
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
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
), issues_by_repo AS (
    SELECT repo_id, COUNT(*) AS issues
    FROM opened_issues oi
    GROUP BY repo_id
), comments_by_repo AS (
    SELECT
        ge.repo_id, COUNT(*) AS comments
    FROM github_events ge
    -- Note: Only consider comments on issues that were opened during the period.
    JOIN opened_issues oi ON oi.repo_id = ge.repo_id AND oi.number = ge.number
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'IssueCommentEvent'
        AND ge.action = 'created'
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY ge.repo_id
)
SELECT
    r.repo_id,
    r.repo_name,
    ibr.issues AS issues,
    cbr.comments AS comments,
    ROUND(cbr.comments / ibr.issues, 2) AS comments_per_issue
FROM repos r
JOIN issues_by_repo ibr ON ibr.repo_id = r.repo_id
JOIN comments_by_repo cbr ON cbr.repo_id = r.repo_id
ORDER BY comments_per_issue DESC
LIMIT {{ n }}
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
            "name": "n",
            "type": "integer",
            "enums": [
                5,
                10,
                20,
                40,
                50
            ],
            "default": 10
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
