import React, { useState, useEffect, useContext, useReducer } from 'react'
import { View, Text, Platform } from "react-native";
import Dialog from "react-native-dialog";

<View>
    <Dialog.Container visible={true}>
      <Dialog.Title>Account delete</Dialog.Title>
      <Dialog.Description>
        Do you want to delete this account? You cannot undo this action.
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={handleCancel} />
      <Dialog.Button label="Delete" onPress={handleDelete} />
    </Dialog.Container>
  </View>
