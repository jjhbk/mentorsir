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
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../../lib/supabase';
import { colors } from '../../theme/colors';

const GOOGLE_WEB_CLIENT_ID = "31324039494-vl1pmf43c22svntt09ro6nagva9ur800.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['email', 'profile'],
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut().catch(() => undefined);
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      if (!tokens.idToken) throw new Error('No ID token returned');
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokens.idToken,
      });
      if (error) throw error;
    } catch (err: unknown) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          Alert.alert('Sign-in cancelled', 'Google sign-in was cancelled.');
        } else if (err.code === statusCodes.IN_PROGRESS) {
          Alert.alert('Please wait', 'A sign-in request is already in progress.');
        } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('Google Play Services required', 'Update/install Play Services and try again.');
        } else {
          Alert.alert(
            'Non-recoverable Google Sign-In failure',
            `Code: ${err.code}\nMessage: ${err.message}\n\nCheck Google OAuth setup (Web Client ID + Android SHA-1/SHA-256 for package com.mentorsir).`
          );
        }
      } else {
        Alert.alert(
          'Sign-in failed',
          err instanceof Error ? `${err.name}: ${err.message}` : 'Please try again.'
        );
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      {/* Decorative background rings */}
      <View style={s.ring1} pointerEvents="none" />
      <View style={s.ring2} pointerEvents="none" />
      <View style={s.ring3} pointerEvents="none" />

      {/* Top — program identity */}
      <View style={s.top}>
        <View style={s.badge}>
          <Text style={s.badgeText}>PTP 2.0</Text>
        </View>
        <Text style={s.wordmark}>Mentor{'\n'}Sir</Text>
        <Text style={s.descriptor}>Prelims Training Programme</Text>
      </View>

      {/* Middle — proof stats */}
      <View style={s.mid}>
        <View style={s.statCard}>
          <Stat value="12" label="Weeks" />
          <View style={s.statDivider} />
          <Stat value="1:1" label="Mentorship" />
          <View style={s.statDivider} />
          <Stat value="∞" label="Revisions" />
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
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.darkBg} size="small" />
          ) : (
            <>
              <Text style={s.btnText}>Continue with Google</Text>
              <Text style={s.btnArrow}>→</Text>
            </>
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
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.darkBg,
    paddingHorizontal: 28,
    paddingBottom: 44,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  // Decorative rings — low-opacity accent circles in top-right corner
  ring1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(156, 107, 46, 0.14)',
    top: -100,
    right: -100,
  },
  ring2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(156, 107, 46, 0.10)',
    top: -40,
    right: -40,
  },
  ring3: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(156, 107, 46, 0.06)',
    top: 20,
    right: 20,
  },

  top: {
    paddingTop: 52,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: 'rgba(156, 107, 46, 0.30)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  wordmark: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -2,
    lineHeight: 58,
  },
  descriptor: {
    fontSize: 14,
    color: colors.darkMuted,
    marginTop: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  mid: {
    gap: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkFaint,
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.darkFaint,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: colors.darkMuted,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  pitch: {
    fontSize: 15,
    color: colors.darkMuted,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
  },

  bottom: {
    gap: 14,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF8F0',
    letterSpacing: 0.2,
  },
  btnArrow: {
    fontSize: 16,
    color: '#FFF8F0',
    fontWeight: '400',
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.darkMuted,
    lineHeight: 18,
  },
});
