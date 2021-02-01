import React, { useState, useEffect, useContext, useReducer } from 'react'
import { StyleSheet, View, Text, Platform } from "react-native";
import * as Permissions from "expo-permissions";
import CupertinoFooter1 from "../components/CupertinoFooter1";
import CupertinoSlider from "../components/CupertinoSlider";
import MaterialButtonShare from "../components/MaterialButtonShare";
import MaterialCardWithoutImage from "../components/MaterialCardWithoutImage";
import MaterialChipWithCloseButton from "../components/MaterialChipWithCloseButton";

import { Audio, AVPlaybackStatus } from "expo-av";

function RecordingView(props) {
  /*  private shouldPlayAtEndOfSeek: boolean;
  
    };*/

  const [haveRecordingPermissions, setHaveRecordingPermissions] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [sound, setSound] = useState(null)
  const [recording, setRecording] = useState(null)

  //const [isSeeking, setIsSeeking] = useState(null)
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(null)
  const [playStatus, setPlayStatus] = useState({
    durationMillis: null, // soundDuration
    positionMillis: null, // soundPosition
    shouldPlay: false,
    isPlaying: false,
    rate: 1.0,
    isMuted: false,
    volume: 1.0,
    shouldCorrectPitch: true,
    error: null,
  })

  useEffect(async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    setHaveRecordingPermissions(response.status === "granted")
  }, [])

  const _onRecordPressed = async () => {
    if (isRecording) {
      _stopRecordingAndEnablePlayback();
    } else {
      _stopPlaybackAndBeginRecording();
    }
  };

  const _stopPlaybackAndBeginRecording = async () => {
    setIsLoading(true)

    if (sound !== null) {
      await sound.unloadAsync();
      sound.setOnPlaybackStatusUpdate(null);
      setSound(null);
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (recording !== null) {
      recording.setOnRecordingStatusUpdate(null);
      setRecording(null);
    }

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY);
    newRecording.setOnRecordingStatusUpdate(_updateScreenForRecordingStatus);

    setRecording(newRecording);
    await newRecording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    setIsLoading(false);
  }

  const _updateScreenForRecordingStatus = (status/*: Audio.RecordingStatus*/) => {
    if (status.canRecord) {
      setIsRecording(status.isRecording)
      setRecordingDuration(status.durationMillis)
    } else if (status.isDoneRecording) {
      setIsRecording(false)
      setRecordingDuration(status.durationMillis)
      if (!isLoading) {
        _stopRecordingAndEnablePlayback();
      }
    }
  };

  const _stopRecordingAndEnablePlayback = async () => {
    setIsLoading(true)
    if (!recording) {
      return;
    }
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      // On Android, calling stop before any data has been collected results in
      // an E_AUDIO_NODATA error. This means no audio data has been written to
      // the output file is invalid.
      if (error.code === "E_AUDIO_NODATA") {
        console.log(
          `Stop was called too quickly, no data has yet been received (${error.message})`
        );
      } else {
        console.log("STOP ERROR: ", error.code, error.name, error.message);
      }
      setIsLoading(false)
      return;
    }

    if (Platform.OS == 'web') {
      console.log(`FILE URL: ${recording.getURI()}`);
    }
    else {
      const info = await FileSystem.getInfoAsync(recording.getURI() || "");
      console.log(`FILE INFO: ${JSON.stringify(info)}`);
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound: newSound, status } = await recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: playStatus.isMuted,
        volume: playStatus.volume,
        rate: playStatus.rate,
        shouldCorrectPitch: playStatus.shouldCorrectPitch,
      },
      _updateScreenForSoundStatus
    );
    setSound(newSound);
    setIsLoading(false);
  }

  const _updateScreenForSoundStatus = (status/*: AVPlaybackStatus*/) => {
    if (status.isLoaded) {
      //status.durationMillis = status.durationMillis ?? null
      setPlayStatus(status)

      setIsPlaybackAllowed(true)
    } else {
      setPlayStatus({
        durationMillis: null,
        positionMillis: null,
      });
      setIsPlaybackAllowed(false)
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };


  const _getMMSSFromMillis = (millis/*: number*/) => {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number) => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  const _getPlaybackTimestamp = () => {
    if (
      sound != null &&
      playStatus.positionMillis != null &&
      playStatus.durationMillis != null
    ) {
      return `${_getMMSSFromMillis(
        playStatus.positionMillis
      )} / ${_getMMSSFromMillis(playStatus.durationMillis)}`;
    }
    return "";
  }

  const _getRecordingTimestamp = () => {
    if (recordingDuration != null) {
      return `${_getMMSSFromMillis(recordingDuration)}`;
    }
    return `${_getMMSSFromMillis(0)}`;
  }

  if (!haveRecordingPermissions) {
    return (
      <View style={styles.container}>
        <View />
        <Text
          style={[
            styles.noPermissionsText,
            { fontFamily: "roboto-regular" },
          ]}
        >
          You must enable audio recording permissions in order to use this
          app.
        </Text>
        <View />
      </View>
    );
  }

  return (
    <View style={[styles.container,
    {
      opacity: isLoading ? DISABLED_OPACITY : 1.0,
    },
    ]}>
      <CupertinoFooter1
        iconName="av-timer"
        btn2Caption="Orderbook"
        btn3Caption="Stats"
        icon2Name="poll"
        icon="microphone"
        btnWrapper1="RecordingView"
        btn1Caption="Record"
        btn2Caption="Listen"
        btn3Caption="Create"
        icon2="android-studio"
        btnWrapper4="Go Back"
        btnWrapper3="Go Back"
        style={styles.footer}
      ></CupertinoFooter1>
      <View style={styles.trackSliderRow}>
        <CupertinoSlider style={styles.trackSlider}
          disabled={!isPlaybackAllowed || isLoading}></CupertinoSlider>
        <MaterialButtonShare
          iconName="share-variant"
          icon="stop"
          style={styles.stopButton}
        ></MaterialButtonShare>
      </View>
      <MaterialCardWithoutImage
        style={styles.startCard}
      ></MaterialCardWithoutImage>
      <View style={styles.recordButtonRow}>
        <MaterialButtonShare
          iconName="share-variant"
          icon={isRecording ? 'pause' : 'microphone'}
          style={styles.recordButton}
          onPress={_onRecordPressed}
          disabled={isLoading}
        ></MaterialButtonShare>
        <Text style={styles.durationLabel}>{_getRecordingTimestamp()/*_getPlaybackTimestamp()*/}</Text>
      </View>
      <View style={styles.preLastTrackPlayButtonRow}>
        <MaterialButtonShare
          iconName="share-variant"
          icon="play"
          style={styles.preLastTrackPlayButton}
        ></MaterialButtonShare>
        <MaterialChipWithCloseButton
          iconStyle="content-save"
          style={styles.preLastTrackName}
        ></MaterialChipWithCloseButton>
      </View>
      <View style={styles.lastTrackPlayButtonRow}>
        <MaterialButtonShare
          iconName="share-variant"
          icon="play"
          style={styles.lastTrackPlayButton}
        ></MaterialButtonShare>
        <MaterialChipWithCloseButton
          iconStyleName="close-circle"
          iconStyle="content-save"
          style={styles.lastTrackName}
        ></MaterialChipWithCloseButton>
      </View>
    </View>
  );
}

const DISABLED_OPACITY = 0.5;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {
    height: 49,
    width: 375,
    marginTop: 652
  },
  trackSlider: {
    width: 147,
    height: 30,
    marginTop: 5
  },
  stopButton: {
    height: 40,
    width: 80,
    backgroundColor: "rgba(255,108,134,1)",
    shadowColor: "rgba(255,108,134,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 30,
    shadowOpacity: 1,
    shadowRadius: 10,
    marginLeft: 78
  },
  trackSliderRow: {
    height: 40,
    flexDirection: "row",
    marginTop: -231,
    marginLeft: 42,
    marginRight: 28
  },
  startCard: {
    height: 217,
    width: 291,
    marginTop: -455,
    marginLeft: 42
  },
  recordButton: {
    borderRadius: 50,
    height: 100,
    width: 100,
    backgroundColor: "rgba(255,108,134,1)",
    shadowColor: "rgba(255,108,134,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 30,
    shadowOpacity: 1,
    shadowRadius: 10
  },
  durationLabel: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 27,
    width: 89,
    marginLeft: 25,
    marginTop: 10
  },
  recordButtonRow: {
    height: 100,
    flexDirection: "row",
    marginTop: 245,
    marginLeft: 137,
    marginRight: 24
  },
  preLastTrackPlayButton: {
    height: 40,
    width: 40,
    backgroundColor: "rgba(255,108,134,1)",
    shadowColor: "rgba(255,108,134,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 30,
    shadowOpacity: 1,
    shadowRadius: 10
  },
  preLastTrackName: {
    height: 32,
    width: 231,
    marginLeft: 18,
    marginTop: 4
  },
  preLastTrackPlayButtonRow: {
    height: 40,
    flexDirection: "row",
    marginTop: -260,
    marginLeft: 45,
    marginRight: 41
  },
  lastTrackPlayButton: {
    height: 40,
    width: 40,
    backgroundColor: "rgba(255,108,134,1)",
    shadowColor: "rgba(255,108,134,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 30,
    shadowOpacity: 1,
    shadowRadius: 10
  },
  lastTrackName: {
    height: 32,
    width: 231,
    marginLeft: 18,
    marginTop: 5
  },
  lastTrackPlayButtonRow: {
    height: 40,
    flexDirection: "row",
    marginTop: 9,
    marginLeft: 45,
    marginRight: 41
  }
});

export default RecordingView;
