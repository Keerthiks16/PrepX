import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS } from './theme';

type IconName = 
  | 'brain' 
  | 'file-text' 
  | 'users' 
  | 'send' 
  | 'sparkles' 
  | 'cpu' 
  | 'chevron-down' 
  | 'chevron-up' 
  | 'briefcase' 
  | 'code' 
  | 'logout' 
  | 'message-square' 
  | 'volume-2' 
  | 'info' 
  | 'mic' 
  | 'mic-off' 
  | 'loader-2'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'user'
  | 'check'
  | 'home'
  | 'chat'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'shield'
  | 'star';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

const ICON_MAP: Record<IconName, string> = {
  brain: '🧠',
  'file-text': '📄',
  users: '👥',
  send: '✉️',
  sparkles: '✦',
  cpu: '⚡',
  'chevron-down': '▼',
  'chevron-up': '▲',
  briefcase: '💼',
  code: '💻',
  logout: '🚪',
  'message-square': '💬',
  'volume-2': '🔊',
  info: 'ℹ️',
  mic: '🎤',
  'mic-off': '🔇',
  'loader-2': '⏳',
  plus: '＋',
  trash: '🗑️',
  edit: '✏️',
  user: '👤',
  check: '✓',
  home: '🏠',
  chat: '💬',
  mail: '✉️',
  lock: '🔒',
  eye: '👁️',
  'eye-off': '🙈',
  shield: '🛡️',
  star: '⭐',
};

export const CustomIcon = ({ name, size = 20, color = COLORS.textPrimary, style }: IconProps) => {
  const symbol = ICON_MAP[name] || '?';
  
  if (name === 'sparkles') {
    return (
      <Text style={[styles.sparkles, { fontSize: size, color }, style]}>
        {symbol}
      </Text>
    );
  }

  return (
    <Text style={[styles.textIcon, { fontSize: size, color }, style]}>
      {symbol}
    </Text>
  );
};

const styles = StyleSheet.create({
  textIcon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  sparkles: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  }
});
