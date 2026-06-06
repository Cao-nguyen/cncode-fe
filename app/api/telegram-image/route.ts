import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route for Telegram images
 * This avoids:
 * 1. Next.js Image domain whitelist issues
 * 2. Telegram file URL expiration
 * 3. Exposing bot token on client side
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get('fileId');
        const filePath = searchParams.get('filePath');

        if (!fileId && !filePath) {
            return NextResponse.json(
                { error: 'Missing fileId or filePath parameter' },
                { status: 400 }
            );
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Build the Telegram file URL
        let telegramUrl: string;
        if (filePath) {
            // Full path provided (e.g., photos/file_0.jpg)
            telegramUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        } else {
            // Just fileId provided - need to get filePath first
            const fileInfoRes = await fetch(
                `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
            );
            const fileInfo = await fileInfoRes.json();

            if (!fileInfo.ok) {
                console.error('Failed to get file info:', fileInfo);
                return NextResponse.json(
                    { error: 'Failed to get file info from Telegram' },
                    { status: 500 }
                );
            }

            telegramUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`;
        }

        // Fetch the image from Telegram
        const imageRes = await fetch(telegramUrl);

        if (!imageRes.ok) {
            console.error('Failed to fetch image from Telegram:', imageRes.status);
            return NextResponse.json(
                { error: 'Failed to fetch image' },
                { status: imageRes.status }
            );
        }

        // Get the image buffer
        const buffer = await imageRes.arrayBuffer();

        // Get content type from response or default to jpeg
        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

        // Return the image with proper headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Telegram image proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}