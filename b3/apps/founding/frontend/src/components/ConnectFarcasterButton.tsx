import { NeynarSigninButton, Theme, Variant } from "@neynar/react-native-signin";
import { Alert, StyleSheet, View } from "react-native";

import { api } from "@/src/api/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { colors, radius } from "@/src/theme";

type Props = {
  compact?: boolean;
};

export function ConnectFarcasterButton({ compact }: Props) {
  const { user, linkFarcaster } = useAuth();

  if (!user || user.farcaster_fid) return null;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} testID="connect-farcaster">
      <NeynarSigninButton
        fetchAuthorizationUrl={async () => {
          const { authorization_url } = await api.getNeynarAuthUrl();
          return authorization_url;
        }}
        successCallback={async (data) => {
          try {
            await linkFarcaster({
              fid: Number(data.fid),
              signer_uuid: data.signer_uuid,
            });
            Alert.alert("Connected", `Farcaster FID ${data.fid} is linked to your builder profile.`);
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Could not link Farcaster";
            Alert.alert("Farcaster", message);
          }
        }}
        errorCallback={(err) => {
          const message = err instanceof Error ? err.message : "Farcaster sign-in was cancelled";
          Alert.alert("Farcaster", message);
        }}
        variant={Variant.FARCASTER}
        theme={Theme.DARK}
        text="Connect Farcaster"
        backgroundColor={colors.surface}
        color={colors.textPrimary}
        borderRadius={radius.pill}
        height={compact ? 40 : 48}
        width={compact ? 200 : 280}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: "100%",
  },
  wrapCompact: {
    alignSelf: "flex-start",
  },
});
