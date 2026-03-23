// fuzzy-match.ts

/**
 * Fuzzy string comparison utilities for typo-tolerant matching.
 */

/**
 * Calculates the similarity score between two strings.
 * @param str1 The first string.
 * @param str2 The second string.
 * @returns A number between 0 and 1 representing similarity.
 */
function similarityScore(str1: string, str2: string): number {
    // Implementation of a simple similarity score algorithm such as Jaro-Winkler or Levenshtein distance
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLength = Math.max(len1, len2);

    // For simplicity, returning a dummy similarity score.
    return (maxLength - Math.abs(len1 - len2)) / maxLength;
}

/**
 * Performs a fuzzy match for a given pattern in a text.
 * @param pattern The pattern to search for.
 * @param text The text to search within.
 * @returns An array of indices where the matches were found.
 */
function fuzzyMatch(pattern: string, text: string): number[] {
    const indices: number[] = [];
    const regex = new RegExp(pattern, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
        indices.push(match.index);
    }

    return indices;
}

/**
 * Finds all matches of a given pattern in a list of strings.
 * @param pattern The pattern to search for.
 * @param items An array of strings to search through.
 * @returns An array of matches with their scores.
 */
function findMatches(pattern: string, items: string[]): { item: string; score: number }[] {
    return items.map(item => ({
        item,
        score: similarityScore(item, pattern)
    })).filter(result => result.score > 0.5);
}

export { similarityScore, fuzzyMatch, findMatches };