
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SPIRITUAL_COLORS, SPIRITUAL_SHADOWS } from '../../constants/SpiritualColors';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
}

interface ShareOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  quote?: Quote;
  onShareWithImage: () => void;
  onShareTextOnly: () => void;
  onShareCustom: () => void;
}

export const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({
  visible,
  onClose,
  quote,
  onShareWithImage,
  onShareTextOnly,
  onShareCustom,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Quote</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={SPIRITUAL_COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={onShareWithImage}>
              <View style={styles.optionIcon}>
                <Icon name="image" size={24} color={SPIRITUAL_COLORS.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Share with Beautiful Image</Text>
                <Text style={styles.optionDescription}>
                  Creates a spiritual quote card with your quote
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={SPIRITUAL_COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onShareTextOnly}>
              <View style={styles.optionIcon}>
                <Icon name="text-fields" size={24} color={SPIRITUAL_COLORS.secondary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Share Text Only</Text>
                <Text style={styles.optionDescription}>
                  Quick text sharing without image
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={SPIRITUAL_COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onShareCustom}>
              <View style={styles.optionIcon}>
                <Icon name="tune" size={24} color={SPIRITUAL_COLORS.accent} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Customize & Share</Text>
                <Text style={styles.optionDescription}>
                  Choose theme and styling options
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={SPIRITUAL_COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    ...SPIRITUAL_SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: SPIRITUAL_COLORS.input,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SPIRITUAL_COLORS.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 18,
  },
});
