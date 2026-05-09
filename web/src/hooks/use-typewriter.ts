import { useEffect, useRef, useState } from 'react';

/**
 * A hook that creates a typewriter effect for streaming text.
 * It progressively reveals the target content in small batches,
 * giving a smooth character-by-character appearance.
 *
 * @param content - The full target text to display
 * @param loading - Whether the content is still being streamed
 * @param charsPerTick - Number of characters to reveal per tick (default: 5)
 * @param intervalMs - Milliseconds between each tick (default: 20)
 * @returns The portion of content to display at the current moment
 */
export function useTypewriter(
  content: string,
  loading: boolean,
  charsPerTick: number = 5,
  intervalMs: number = 20,
): string {
  const [displayedLength, setDisplayedLength] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef(content);

  // Keep content ref in sync
  contentRef.current = content;

  useEffect(() => {
    // If not loading and we've caught up, nothing to do
    if (!loading && displayedLength >= content.length) {
      return;
    }

    // If already caught up, wait for new content
    if (displayedLength >= content.length) {
      return;
    }

    // Start the interval to progressively reveal characters
    timerRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        const target = contentRef.current.length;
        if (prev >= target) {
          // Caught up, clear interval
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }
        // Reveal next batch of characters
        return Math.min(prev + charsPerTick, target);
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [content.length, loading, displayedLength, charsPerTick, intervalMs]);

  // When loading finishes, immediately show all remaining content
  useEffect(() => {
    if (!loading && content.length > 0) {
      // Small delay to let last batch complete, then show all
      const timer = setTimeout(() => {
        setDisplayedLength(content.length);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, content.length]);

  // Reset when content is cleared (new conversation)
  useEffect(() => {
    if (content === '') {
      setDisplayedLength(0);
    }
  }, [content]);

  // Return the portion of content to display
  return content.slice(0, displayedLength);
}
