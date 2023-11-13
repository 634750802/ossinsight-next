import loadEndpoint, { hasEndpoint } from '@ossinsight/endpoints';
import { APIError, executeEndpoint } from '@ossinsight/endpoints-core';
import { NextRequest } from 'next/server';

interface Params {
  query: string | string[];
}

export const runtime = 'edge';

export async function GET (req: NextRequest, reqCtx: { params: Params }) {
  const queryName = getQueryName(reqCtx.params);

  if (!hasEndpoint(queryName)) {
    return new Response(JSON.stringify({ message: 'Endpoint not found.' }), {
      status: 404,
    });
  }

  const endpoint = await loadEndpoint(queryName);

  const params: any = {};
  for (let [name, value] of req.nextUrl.searchParams.entries()) {
    const prev = params[name];
    if (prev != null) {
      if (prev instanceof Array) {
        prev.push(value);
      } else {
        params[name] = [prev, value];
      }
    } else {
      params[name] = value;
    }
  }

  let result;
  try {
    result = await executeEndpoint(queryName, endpoint.config, endpoint.sql, params, req.geo);
  } catch (err: any) {
    if (err instanceof APIError) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: err.statusCode,
      });
    } else {
      console.error(err);
      return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=60',
      'CDN-Cache-Control': 'max-age=300',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}

function getQueryName ({ query }: Params) {
  if (typeof query === 'string') {
    return decodeURIComponent(query);
  } else {
    return query.map(decodeURIComponent).join('/');
  }
}
