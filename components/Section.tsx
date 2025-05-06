import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../config/theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  showDivider?: boolean;
  rightContent?: React.ReactNode;
  testID?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  titleStyle,
  contentStyle,
  showDivider = false,
  rightContent,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {rightContent && <View>{rightContent}</View>}
        </View>
      )}
      
      {showDivider && <View style={styles.divider} />}
      
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginBottom: theme.spacing.md,
  },
  content: {},
});

export default Section; 