import React, { useState, useEffect, useContext, useReducer, useRef } from 'react'
import { View, Text, Platform } from "react-native";
import * as Permissions from "expo-permissions";
import CupertinoFooter from "../components/CupertinoFooter";
import ButtonShare from "../components/MaterialButtonShare";
import MaterialCardWithoutImage from "../components/MaterialCardWithoutImage";
import Dialog from "react-native-dialog";

import { Audio, AVPlaybackStatus } from "expo-av";
import styles from './RecordingViewStyle';
import PlaySlider, { _getMMSSFromMillis } from '../components/PlaySlider';
import PlaySliderSaved from '../components/PlaySliderSaved';

interface IRecording {
  title: string
  sound: any
  playStatus: AVPlaybackStatus
  isPlaying: boolean
}

function RecordingView(props) {
  const [haveRecordingPermissions, setHaveRecordingPermissions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Audio.Recording, check if == null
  const [recording, setRecording] = useState(null)
  // needed because recording may be in status Done
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(null)

  // recording is converted in sound
  const [sound, setSound] = useState(null)
  // sound is saved in recordings with title
  const [isSoundTitled, setIsSoundTitled] = useState(false)
  // IRecording[]
  const [recordings, setRecordings] = useState([])

  // sound some time is not allowed to play
  const [isPlaybackAllowed, setIsPlaybackAllowed] = useState(false)

  const [dialogAsk, setDialogAsk] = useState(0)
  const dialogAskInputRef = useRef(null);

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

  useEffect(() => {
    async function getPerm() {
      const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      setHaveRecordingPermissions(response.status === "granted")
    };
    getPerm();
  }, [])

  const _onRecordPressed = async () => {
    if (recording) {
      _stopRecordingAndEnablePlayback()
      setDialogAsk(1)
    } else {
      if (sound) {
        if (isPlaying) {
          sound.pauseAsync()
          setIsPlaying(false)
        }
        setDialogAsk(2)
      } else
        _stopPlaybackAndBeginRecording()
    }
  };
  // when there is no sound or sound is not saved
  const _onDeletePressed = async () => {
    if (sound)
      _stopPlaying()
    else
      await _stopRecording()
  }
  const cancelSound = () => {
    if (dialogAsk == 2) {
      _stopPlaybackAndBeginRecording()
    }
    setDialogAsk(0)
  };
  const saveSound = () => {
    let input = dialogAskInputRef.current
    playStatus.durationMillis = recordingDuration
    const newRecording: IRecording = {
      title: input.value != '' ? input.value : _defaultTitle(true),
      sound,
      playStatus: playStatus,
      isPlaying: false,
    }
    setRecordings([newRecording, ...recordings])

    _stopPlaying(false)
    setDialogAsk(0)
  };


  const _stopPlaybackAndBeginRecording = async () => {
    setIsLoading(true)
    _stopPlaying()
    await _stopRecording()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

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
  const _stopRecording = async () => {
    if (recording) {
      recording.setOnRecordingStatusUpdate(null)
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
      } finally {
        setRecording(null)
      }
    }
    setIsRecording(false)
    // value will be used  setRecordingDuration(null)
  }
  const _stopPlaying = async (unload = true) => {
    if (sound) {
      if (unload) {
        sound.setOnPlaybackStatusUpdate(null)
        await sound.unloadAsync()
      }
      setSound(null)
    }
    setIsPlaying(false)
    setIsPlaybackAllowed(false)
  }

  const _stopRecordingAndEnablePlayback = async () => {
    if (!recording) {
      return;
    }
    setIsLoading(true)
    _stopPlaying()
    await _stopRecording() // here setRecording(null)

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

    return newSound
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


  const _getRecordingTimestamp = () => {
    return `${_getMMSSFromMillis((isRecording && recordingDuration) ? recordingDuration : 0)}`;
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
  const _onPlayPausePressed0 = async () => {
    let souncWas = sound ?? await _stopRecordingAndEnablePlayback()

    if (isPlaying) {
      souncWas.pauseAsync();
    } else {
      souncWas.playAsync();
    }
    setIsPlaying(!isPlaying)
  };

  const _defaultTitle = (saved = false) => {
    return `${saved ? 'New' : 'Unsaved'} recording ${recordings.length + 1}`
  }

  if (!haveRecordingPermissions) {
    return (
      <View style={styles.container}>
        <View />
        <Text style={{ textAlign: "center" }}
        >
          You must enable audio recording permissions in order to use this app.
        </Text>
        <View />
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      opacity: isLoading ? DISABLED_OPACITY : 1.0,
      justifyContent: 'flex-end',
      alignItems: 'center',
      alignSelf: 'center',
      maxWidth: 600,
    }}>
      <MaterialCardWithoutImage style={styles.startCard}
        h='Record your voice'
      >Begin by finding a relaxed position, sitting or lying down. Set aside a few minutes to relax.</MaterialCardWithoutImage>
      {false && <MaterialCardWithoutImage style={styles.startCard}
      >Breathe slowly inside...
      and out...</MaterialCardWithoutImage>}
      <View style={{
        flex: 1, justifyContent: "flex-end", alignSelf: 'stretch',
        marginLeft: 10, marginRight: 10
      }}>
        <PlaySliderSaved index={2} recordings={recordings} redraw={setRecordings} />
        <PlaySliderSaved index={1} recordings={recordings} redraw={setRecordings} />
        <PlaySliderSaved index={0} recordings={recordings} redraw={setRecordings} />
        <View style={styles.trackRow}>
          <ButtonShare icon={isPlaying ? "pause-circle-outline" : "play-outline"}
            onPress={_onPlayPausePressed0}
            disabled={!(isPlaybackAllowed || isRecording && (recordingDuration > 2000))} />
          {sound && <PlaySlider title={_defaultTitle()}
            disabled={isPlaybackAllowed || isLoading}
            playStatus={playStatus} recordingDuration={recordingDuration} />}
          {!sound &&
            <Text style={{ flex: 1, alignSelf: 'center', textAlign: 'center', fontSize: 20 }}
            >{_getRecordingTimestamp()}</Text>}
          <ButtonShare icon="delete-outline" disabled={!(isRecording || isPlaybackAllowed)}
            onPress={_onDeletePressed} />
        </View>
      </View>
      <View style={styles.recordButtonRow}>
        <ButtonShare
          icon={isRecording ? 'content-save-outline' : 'microphone-outline'}
          style={styles.recordButton}
          iconStyle={{ fontSize: 40 }}
          onPress={_onRecordPressed}
          disabled={isLoading}
        ></ButtonShare>
      </View>
      <View>
        <Dialog.Container visible={dialogAsk != 0} onBackdropPress={cancelSound}>
          <Dialog.Title>Save your recording</Dialog.Title>
          <Dialog.Description>
            TITLE
          </Dialog.Description>
          <Dialog.Input placeholder={_defaultTitle()} textInputRef={dialogAskInputRef}
            style={{ fontSize: 24 }} />
          <Dialog.Button label={dialogAsk == 2 ? 'DELETE' : 'Cancel'} onPress={cancelSound} />
          <Dialog.Button label="Save" onPress={saveSound} />
        </Dialog.Container>
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
    </View >
  );
}

const DISABLED_OPACITY = 0.5;

export default RecordingView;
