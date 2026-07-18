import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_PALETTE, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';
import { googleSheetsService } from '@/services/googleSheetsService';
import { env } from '@/config/env';
import { styles } from '@/styles/prayer.styles';

const PRAYER_MAX_LENGTH = 3000;

export default function PrayerScreen() {
  const [name, setName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [phoneAreaCode, setPhoneAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [prayer, setPrayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setPhotoUri(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const isEmailValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const mandatoryFilled = useMemo(() => {
    const n = name.trim();
    const d = dobDay.trim();
    const m = dobMonth.trim();
    const y = dobYear.trim();
    const c = city.trim();
    const co = country.trim();
    const ac = phoneAreaCode.trim();
    const pn = phoneNumber.trim();
    const em = email.trim();
    const pr = prayer.trim();
    return (
      n.length > 0 &&
      d.length > 0 &&
      m.length > 0 &&
      y.length > 0 &&
      c.length > 0 &&
      co.length > 0 &&
      ac.length > 0 &&
      pn.length > 0 &&
      em.length > 0 &&
      isEmailValid(em) &&
      pr.length > 0 &&
      pr.length <= PRAYER_MAX_LENGTH
    );
  }, [name, dobDay, dobMonth, dobYear, city, country, phoneAreaCode, phoneNumber, email, prayer]);

  const prayerOverLimit = prayer.length > PRAYER_MAX_LENGTH;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (prayerOverLimit) {
      Alert.alert('Prayer too long', `Your prayer is ${prayer.length} characters — the maximum is ${PRAYER_MAX_LENGTH}. Please shorten it before submitting.`);
      return;
    }
    if (!mandatoryFilled) {
      Alert.alert('Missing required fields', 'Please fill in all required fields before submitting your prayer.');
      return;
    }
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSubmitting(true);
    const userEmail = email.trim();
    try {
      let photoBase64: string | null = null;
      let photoMimeType = 'image/jpeg';
      if (photoUri && Platform.OS !== 'web') {
        try {
          photoBase64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          if (photoUri.toLowerCase().includes('.png')) photoMimeType = 'image/png';
        } catch (e) {
          console.warn('Could not read photo as base64:', e);
        }
      }
      await googleSheetsService.submitPrayer(
        {
          name: name.trim(),
          dateOfBirth: `${dobDay.trim()}/${dobMonth.trim()}/${dobYear.trim()}`,
          city: city.trim(),
          country: country.trim(),
          phone: `${phoneAreaCode.trim()} ${phoneNumber.trim()}`.trim(),
          email: userEmail,
          prayer: prayer.trim(),
          hasPhoto: !!photoUri,
          ...(photoBase64 && { photoBase64, photoMimeType }),
        },
        env.prayerRecipientEmail
      );
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        'Prayer sent',
        `Your prayer has been submitted. A confirmation email has been sent to ${userEmail}. May Om Siddheshwar's blessings be with you.`,
        [{ text: 'OK' }]
      );
      setName('');
      setDobDay('');
      setDobMonth('');
      setDobYear('');
      setCity('');
      setCountry('');
      setPhotoUri(null);
      setPhoneAreaCode('');
      setPhoneNumber('');
      setEmail('');
      setPrayer('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={true}
          >
            {/* Hero / Banner section */}
            <View style={styles.heroContainer}>
              <Image
                source={require('@/assets/images/om_logo_transparent.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(247,236,220,0)', 'rgba(247,236,220,0.85)', '#F7ECDC']}
                style={styles.heroFade}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Send a prayer to Om Siddheshwar</Text>
                <Text style={styles.heroSubtitle}>
                  Through this medium you can send your prayers and wishes to Om Siddheshwar. Your heartfelt
                  words will be received with love and blessings.
                </Text>
                <View style={styles.privacyNote}>
                  <Ionicons name="lock-closed" size={13} color={SPIRITUAL_PALETTE.brown500} />
                  <Text style={styles.privacyText}>
                    This prayer is private and will reach Om Siddheshwar directly. No one else will view what you've shared.
                  </Text>
                </View>
              </View>
            </View>

            {/* Form card */}
            <View style={[styles.formCard, SPIRITUAL_SHADOWS.card]}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Person being prayed for"
                  placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputDD]}
                    placeholder="DD"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={dobDay}
                    onChangeText={setDobDay}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.inputMM]}
                    placeholder="MM"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={dobMonth}
                    onChangeText={setDobMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.inputYYYY]}
                    placeholder="YYYY"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={dobYear}
                    onChangeText={setDobYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>City and Country *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputCity]}
                    placeholder="City"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={city}
                    onChangeText={setCity}
                  />
                  <TextInput
                    style={[styles.input, styles.inputCountry]}
                    placeholder="Country"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={country}
                    onChangeText={setCountry}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Photo of person (optional)</Text>
                {photoUri ? (
                  <View style={styles.photoRow}>
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    <TouchableOpacity style={styles.removePhotoBtn} onPress={removePhoto}>
                      <Ionicons name="close-circle" size={28} color={SPIRITUAL_COLORS.spiritualRed} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage} activeOpacity={0.8}>
                    <Ionicons name="image-outline" size={32} color={SPIRITUAL_COLORS.primary} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputAreaCode]}
                    placeholder="+1"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={phoneAreaCode}
                    onChangeText={(t) => {
                      const digits = t.replace(/[^0-9]/g, '');
                      setPhoneAreaCode(digits ? `+${digits}` : '');
                    }}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.inputPhone]}
                    placeholder="234 567 8900"
                    placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Prayer *</Text>
                <Text style={styles.labelSub}>Max {PRAYER_MAX_LENGTH} characters (~400–500 words)</Text>
                <TextInput
                  style={[styles.textArea, prayerOverLimit && styles.textAreaError]}
                  placeholder="Write your prayer or wishes here..."
                  placeholderTextColor={SPIRITUAL_PALETTE.brown400}
                  value={prayer}
                  onChangeText={setPrayer}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, prayerOverLimit && styles.charCountOver]}>
                  {prayer.length} / {PRAYER_MAX_LENGTH}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonBusy]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                    <Text style={styles.submitButtonText}>Submit prayer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
