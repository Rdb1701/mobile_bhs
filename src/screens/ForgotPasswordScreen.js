import {Text, SafeAreaView, View, StyleSheet, Button, Platform } from "react-native";
import FormTextField from "./components/FormTextField";
import { useState, useContext } from "react";
import axios from "../../utils/axios";
import { sendPasswordResetLink } from "../../services/AuthService";
import AuthContext from "../../context/AuthContext";

export default function () {

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [resetStatus, setResetStatus] = useState("");

  async function handleForgotPassword() {
    setErrors({});
    setResetStatus("");

    try {
     const status = await sendPasswordResetLink(email);
      setResetStatus(status);
      console.log(user);
    } catch (e) {
      console.log(e.response.data);
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
      {resetStatus && <Text style = {styles.resetStatus}>{resetStatus}</Text>}
        <FormTextField
          label="Email Address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          errors={errors.email}
        />
      
        <Button title="Email Reset Password Link" onPress={handleForgotPassword} />
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#fff", flex: 1 },
  container: { padding: 20, rowGap: 16 },
  resetStatus: {marginBottom: 10, color: "green"}
});
