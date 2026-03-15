/**
 * API Route: /api/items
 *
 * GET: Query items from Cosmos DB
 * POST: Create new item
 *
 * @workspace This example shows how to use Cosmos DB in Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryItems, createItem } from '@/lib/cosmos';

/**
 * GET /api/items
 * Query items from the 'items' container
 * Optional query params: ?status=active
 */
export async function GET(request: NextRequest) {
  try {
    // Example: filter by status if provided
    const status = request.nextUrl.searchParams.get('status');

    let query = 'SELECT * FROM c';
    const parameters: { name: string; value: string }[] = [];

    if (status) {
      query += ' WHERE c.status = @status';
      parameters.push({ name: '@status', value: status });
    }

    const items = await queryItems('items', query, parameters);

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        items,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/items error:', message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/items
 * Create a new item in the 'items' container
 *
 * Body: { id: string, name: string, status: string, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.id || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: id, name',
        },
        { status: 400 },
      );
    }

    // Create item with timestamp
    const item = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createItem('items', item);

    return NextResponse.json(
      {
        success: true,
        item: created,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/items error:', message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
