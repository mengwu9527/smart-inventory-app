import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.backgroundTertiary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, height: 44 },
  addButton: { width: 44, height: 44, borderRadius: BorderRadius.lg, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.lg },
  itemCard: { backgroundColor: theme.backgroundDefault, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm },
});
