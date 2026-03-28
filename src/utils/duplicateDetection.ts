import { Incident } from '@/types';
import { isWithinRadius } from './distance';

export interface DuplicateGroup {
  incidents: Incident[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Detect possible duplicate incidents based on:
 * - Same incident type
 * - Nearby coordinates (within radius)
 * - Time difference (e.g., < 15 minutes)
 */
export function detectDuplicates(
  incidents: Incident[],
  radiusKm: number = 1,
  timeThresholdMinutes: number = 15
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < incidents.length; i++) {
    if (processed.has(incidents[i].id)) continue;

    const group: Incident[] = [incidents[i]];
    const reasons: string[] = [];

    for (let j = i + 1; j < incidents.length; j++) {
      if (processed.has(incidents[j].id)) continue;

      const incident1 = incidents[i];
      const incident2 = incidents[j];

      // Check if same category
      const sameCategory = incident1.category === incident2.category;

      // Check if nearby
      const nearby = isWithinRadius(
        incident1.location.lat,
        incident1.location.lng,
        incident2.location.lat,
        incident2.location.lng,
        radiusKm
      );

      // Check time difference
      const timeDiff = Math.abs(
        incident1.reportedAt.getTime() - incident2.reportedAt.getTime()
      );
      const timeDiffMinutes = timeDiff / (1000 * 60);
      const withinTimeThreshold = timeDiffMinutes < timeThresholdMinutes;

      // If all conditions match, it's likely a duplicate
      if (sameCategory && nearby && withinTimeThreshold) {
        group.push(incident2);
        processed.add(incident2.id);
        
        if (sameCategory) reasons.push('Same type');
        if (nearby) reasons.push('Nearby location');
        if (withinTimeThreshold) reasons.push('Similar time');
      }
    }

    if (group.length > 1) {
      processed.add(incidents[i].id);
      
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (group.length >= 3) {
        confidence = 'high';
      } else if (group.length === 2) {
        confidence = 'medium';
      }

      groups.push({
        incidents: group,
        confidence,
        reason: reasons.join(', '),
      });
    }
  }

  return groups;
}

/**
 * Check if an incident is part of a duplicate group
 */
export function isDuplicate(incidentId: string, duplicateGroups: DuplicateGroup[]): boolean {
  return duplicateGroups.some(group =>
    group.incidents.some(inc => inc.id === incidentId)
  );
}

/**
 * Get duplicate group for a specific incident
 */
export function getDuplicateGroup(
  incidentId: string,
  duplicateGroups: DuplicateGroup[]
): DuplicateGroup | undefined {
  return duplicateGroups.find(group =>
    group.incidents.some(inc => inc.id === incidentId)
  );
}
