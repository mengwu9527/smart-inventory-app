import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: theme.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  listContent: { padding: Spacing.lg },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm },
});
