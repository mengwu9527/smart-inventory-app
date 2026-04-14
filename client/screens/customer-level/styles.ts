import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  listContent: { padding: Spacing.lg },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: theme.primary, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  levelCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm },
  levelBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});
