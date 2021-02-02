import React, { useState, useEffect, useContext, useReducer } from 'react'
import { View, Text, Platform } from "react-native";
import * as Permissions from "expo-permissions";
import CupertinoFooter from "../components/CupertinoFooter";
import CupertinoSlider from "../components/CupertinoSlider";
import ButtonShare from "../components/MaterialButtonShare";
import MaterialCardWithoutImage from "../components/MaterialCardWithoutImage";
import ChipWithButton from "../components/MaterialChipWithCloseButton";
import Slider from "@react-native-community/slider";

import { Audio, AVPlaybackStatus } from "expo-av";
import styles from './RecordingViewStyle';
import { TextStroke } from '../components/TextStroke';
import Dialog from "react-native-dialog";

function RecordingView(props) {
  /*  private shouldPlayAtEndOfSeek: boolean;
  
    };*/

  const [haveRecordingPermissions, setHaveRecordingPermissions] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [sound, setSound] = useState(null)
  const [recording, setRecording] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(null)

  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false)
  const [playStatus, setPlayStatus] = useState({
    durationMillis: null, // soundDuration
    positionMillis: null, // soundPosition
    //shouldPlay: false,
    rate: 1.0,
    isMuted: false,
    volume: 1.0,
    shouldCorrectPitch: true,
    error: null,
  })
  // playStatus.isPlaying == false in the end of loop
  const [isPlaying, setIsPlaying] = useState(false)
  //const [isSeeking, setIsSeeking] = useState(null)

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

  const _updateScreenForRecordingStatus = (status: Audio.RecordingStatus) => {
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
        //progressUpdateIntervalMillis: 50,
      },
      _updateScreenForSoundStatus
    );
    setSound(newSound);
    setIsLoading(false);
  }

  // called during playback as well, but not for every tick
  const _updateScreenForSoundStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPlayStatus(status)
      setIsPlaybackAllowed(true)
    } else {
      setPlayStatus({
        durationMillis: null,
        positionMillis: null,
      })
      setIsPlaybackAllowed(false)
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };


  const _getMMSSFromMillis = (millis: number) => {
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



  const _onSeekSliderSlidingComplete = async (value: number) => {
    /*if (sound != null) {
      setIsSeeking(false);
      const seekPosition = value * (playStatus.durationMillis || 0);
      if (shouldPlayAtEndOfSeek) {
        sound.playFromPositionAsync(seekPosition);
      } else {
        sound.setPositionAsync(seekPosition);
      }
    }*/
  };
  const _onPlayPausePressed0 = () => {
    if (isPlaying) {
      sound.pauseAsync();
    } else {
      sound.playAsync();
    }
    setIsPlaying(!isPlaying)
  };
  const _onPlayPausePressed1 = () => {
    if (isPlaying) {
      sound.pauseAsync();
    } else {
      sound.playAsync();
    }
    setIsPlaying(!isPlaying)
  };
  const _getSeekSliderPosition = () => {
    if (
      sound != null &&
      playStatus.durationMillis != null &&
      playStatus.positionMillis != null
    ) {
      return playStatus.positionMillis / playStatus.durationMillis;
    }
    return 0;
  }


  if (!haveRecordingPermissions) {
    return (
      <View style={styles.container}>
        <View />
        <Text style={{ textAlign: "center" }}
        >
          You must enable audio recording permissions in order to use this
          app.
        </Text>
        <View />
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      opacity: isLoading ? DISABLED_OPACITY : 1.0,
    }}>
      <View style={{
        flex: 1, justifyContent: "flex-end", alignItems: 'strech',
        marginLeft: 10, marginRight: 10
      }}>
  <View visible={true}>
    <Dialog.Container>
      <Dialog.Title>Account delete</Dialog.Title>
      <Dialog.Description>
        Do you want to delete this account? You cannot undo this action.
      </Dialog.Description>
      <Dialog.Button label="Cancel" />
      <Dialog.Button label="Delete" />
    </Dialog.Container>
  </View>

        <View style={styles.trackRow}>
          <ButtonShare icon="play-outline" onPress={_onPlayPausePressed1}
            disabled={!isPlaybackAllowed || isLoading} />
          <ChipWithButton iconName="close" >
            <Slider style={{
              position: 'absolute', left: 0, zIndex: -1,
              width: '100%',
            }}
              trackHeight={40} thumbSize={0}
              maximumTrackTintColor={'transparent'}
              value={_getSeekSliderPosition()}
              onSlidingComplete={_onSeekSliderSlidingComplete}
              disabled={isPlaybackAllowed || isLoading}
            />
          </ChipWithButton>
          <Text style={styles.trackText}>{_getPlaybackTimestamp()}</Text>
          <ButtonShare icon="delete-outline" />
        </View>
        <View style={styles.trackRow}>
          <ButtonShare icon={isPlaying ? "pause-circle-outline" : "play-outline"}
            onPress={_onPlayPausePressed0} />
          <Text style={{ flex: 1, alignSelf: 'center', textAlign: 'center' }}>{_getRecordingTimestamp()}</Text>
          <ButtonShare icon="delete-outline" />
        </View>
      </View>
      <View style={styles.recordButtonRow}>
        <ButtonShare
          iconName="share-variant"
          icon={isRecording ? 'content-save-outline' : 'microphone-outline'}
          style={styles.recordButton}
          iconStyle={{ fontSize: 40 }}
          onPress={_onRecordPressed}
          disabled={isLoading}
        ></ButtonShare>
      </View>
      <CupertinoFooter
        icon="microphone"
        btnWrapper1="RecordingView"
        btn1Caption="Record"
        btn2Caption="Listen"
        btn3Caption="Create"
        icon2="android-studio"
        btnWrapper4="Go Back"
        btnWrapper3="Go Back"
        style={styles.footer}
      ></CupertinoFooter>


      <MaterialCardWithoutImage
        style={styles.startCard}
      ></MaterialCardWithoutImage>

    </View >
  );
}

const DISABLED_OPACITY = 0.5;

export default RecordingView;
