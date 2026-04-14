import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: { padding: Spacing.lg },
  section: { borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: theme.primary, borderRadius: BorderRadius.md, padding: Spacing.md },
  deviceItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: theme.borderLight },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
});
