import { SafeAreaView, View, StyleSheet, Button, Platform } from "react-native";
import FormTextField from "./components/FormTextField";
import { useState, useContext } from "react";
import axios from "../../utils/axios";
import { register, loadUser } from "../../services/AuthService";
import AuthContext from "../../context/AuthContext";

export default function () {
  const { setUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});

  async function handleRegister({ navigation }) {
    setErrors({});
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        device_name: `${Platform.OS} ${Platform.Version}`,
      });

      //console.log("res", data);

      const user = await loadUser();
      setUser(user);

      //direct to home after register
      navigation.replace("Home");

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
        <FormTextField
          label="Name"
          value={name}
          onChangeText={(text) => setName(text)}
          errors={errors.name}
        />

        <FormTextField
          label="Email Address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          errors={errors.email}
        />
        <FormTextField
          label="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
          errors={errors.password}
        />

        <FormTextField
          label="Password Confirmation"
          secureTextEntry={true}
          value={passwordConfirmation}
          onChangeText={(text) => setPasswordConfirmation(text)}
          errors={errors.password_confirmation}
        />

        <Button title="Sign Up" onPress={handleRegister} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#fff", flex: 1 },
  container: { padding: 20, rowGap: 16, marginTop: 200},
});
