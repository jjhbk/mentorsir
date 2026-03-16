import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme/colors';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['email', 'profile'],
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      if (!tokens.idToken) throw new Error('No ID token returned');
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokens.idToken,
      });
      if (error) throw error;
    } catch (err: unknown) {
      Alert.alert('Sign-in failed', err instanceof Error ? err.message : 'Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      {/* Top — program identity */}
      <View style={s.top}>
        <Text style={s.programLabel}>PTP 2.0</Text>
        <Text style={s.wordmark}>MentorSir</Text>
        <Text style={s.descriptor}>Prelims Training Programme</Text>
      </View>

      {/* Middle — what this is */}
      <View style={s.mid}>
        <View style={s.statRow}>
          <Stat value="12" label="weeks" />
          <View style={s.statDivider} />
          <Stat value="1:1" label="mentorship" />
          <View style={s.statDivider} />
          <Stat value="∞" label="revisions" />
        </View>
        <Text style={s.pitch}>
          A structured daily system for serious{'\n'}UPSC Prelims aspirants.
        </Text>
      </View>

      {/* Bottom — CTA */}
      <View style={s.bottom}>
        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.darkBg} size="small" />
          ) : (
            <Text style={s.btnText}>Continue with Google</Text>
          )}
        </TouchableOpacity>
        <Text style={s.terms}>
          By continuing you agree to our terms of service.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.darkBg,
    paddingHorizontal: 32,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  top: {
    paddingTop: 48,
  },
  programLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  wordmark: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  descriptor: {
    fontSize: 15,
    color: colors.darkMuted,
    marginTop: 8,
    fontWeight: '400',
  },
  mid: {
    gap: 28,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2E2820',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2E2820',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: colors.darkMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  pitch: {
    fontSize: 16,
    color: colors.darkMuted,
    lineHeight: 26,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottom: {
    gap: 16,
  },
  btn: {
    backgroundColor: colors.darkText,
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkBg,
    letterSpacing: 0.2,
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.darkMuted,
    lineHeight: 18,
  },
});
