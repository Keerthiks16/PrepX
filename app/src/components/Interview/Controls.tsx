import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, globalStyles } from '../Common/theme';
import { CustomIcon } from '../Common/icons';

type Props = {
  isActive: boolean;
  isListening: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
};

const Controls = ({ isActive, isListening, onStart, onEnd, onToggleMic }: Props) => {
  return (
    <View style={styles.container}>
      {!isActive ? (
        <TouchableOpacity
          onPress={onStart}
          style={globalStyles.accentButton}
        >
          <Text style={globalStyles.accentButtonText}>Start Session</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.activeRow}>
          <TouchableOpacity
            onPress={onToggleMic}
            style={[
              styles.micBtn,
              isListening
                ? styles.micBtnActive
                : styles.micBtnInactive
            ]}
          >
            <CustomIcon 
              name={isListening ? 'mic-off' : 'mic'} 
              size={24} 
              color={isListening ? COLORS.textPrimary : COLORS.accent} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEnd}
            style={styles.endBtn}
          >
            <Text style={styles.endBtnText}>End Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg800,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.bg600,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  micBtnActive: {
    backgroundColor: COLORS.error,
  },
  micBtnInactive: {
    backgroundColor: COLORS.bg900,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  endBtn: {
    backgroundColor: COLORS.errorGlow,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  endBtnText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Controls;
