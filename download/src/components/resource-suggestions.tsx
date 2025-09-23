'use client';

import { suggestResourcesAction } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Link, Sparkles } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ResourceSuggestionsProps {
  taskDescription: string;
}

export default function ResourceSuggestions({ taskDescription }: ResourceSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (taskDescription && taskDescription.trim().length > 20) {
        setLoading(true);
        const result = await suggestResourcesAction(taskDescription);
        if (result.suggestions) {
          setSuggestions(result.suggestions);
        }
        setLoading(false);
      } else {
        setSuggestions([]);
      }
    };

    const handler = setTimeout(() => {
      fetchSuggestions();
    }, 1000); // Debounce for 1 second

    return () => {
      clearTimeout(handler);
      setLoading(false);
    };
  }, [taskDescription]);

  if (!loading && suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 bg-background/50 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-accent" />
          AI Resource Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <Link className="w-4 h-4 mr-2 mt-1 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
