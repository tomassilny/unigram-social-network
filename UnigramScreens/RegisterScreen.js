import React, { useState } from 'react';
import WhiteBox from './../UnigramComponents.js'
import { ImageBackground, Platform, StyleSheet, Text, View, Image, TextInput, Button, Picker, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import ConnectyCube from "react-native-connectycube";
import Login from './LoginScreen.js';
import AsyncStorage from '@react-native-community/async-storage'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});

var radio_props = [
  { label: 'Woman', value: "Woman" },
  { label: 'Man', value: "Man" }
];

const goToChat = () => {
  Actions.chat()
}

const CREDENTIALS = {
  appId: 2603,
  authKey: "fqk7-UcAujDnEMb",
  authSecret: "OeL8V8ubSvRLwSX"
};

ConnectyCube.init(CREDENTIALS);
ConnectyCube.createSession()
  .then((session) => { })
  .catch((error) => { });

const goToLogin = () => {
  Actions.login()
}



class Register extends React.Component {


  updateUniversity = (university) => {
    this.setState({ university: university })
  }

  updateFaculty = (faculty) => {
    this.setState({ faculty: faculty })
  }

  state = {
    firstname: '',
    surname: '',
    email: '',
    pass: '',
    dataRegister: '',
    data: '',
    university: "",
    faculty: "",
    gender: ""
  }

  register = () => {
    const { email } = this.state;
    const { firstname } = this.state;
    const { surname } = this.state;
    const { pass } = this.state;
    const { university } = this.state;
    const { faculty } = this.state;

    var register = true;

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
      Alert.alert("Upozornenie", "Nesprávny fomát E-Mailu");
      register = false;
    }

    if (firstname == '' || surname == '' || email == '' || pass == '') {
      Alert.alert("Upozornenie", "Musíte vyplniť všetky polia");
      register = false;
    }

    if (pass.length < 8) {
      Alert.alert("Upozornenie", "Heslo musí obsahovať minimálne 8 znakov");
      register = false;
    }

    // Check if email is not in use
    fetch('https://wawier.com/unigram/checkemail.php?email=' + email, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          data: responseJson
        })

        const { data } = this.state;

        if (data.id > 0) {
          Alert.alert("Chyba", "Zadaný E-Mail už niekto používa");
          register = false;
        }
      })
      .catch((error) => {
        console.error(error);
      });



    if (register) {
      // SQL register and parse number of ID or 0 if error
      Alert.alert("Registrácia", "Prebieha registrácia...");
      fetch('https://wawier.com/unigram/register.php?name=' + firstname + '&surname=' + surname +
        '&email=' + email + '&pass=' + pass + '&college=' + faculty + '&university=' + university, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            dataRegister: responseJson
          })

          const { dataRegister } = this.state;

          if (dataRegister.id > 0) {
            // If register to MySQL success, register to ConnectyCube
            const userProfile = {
              login: email,
              password: pass,
              email: email,
              full_name: firstname + " " + surname,
            };

            ConnectyCube.users.signup(userProfile, (error, user) => { });

            const dataUser = { full_name: firstname + " " + surname, login: email, password: pass }
            AuthService.signIn(dataUser)
            // Register successfull
            AsyncStorage.setItem("@id", JSON.stringify(dataRegister.id), () => Actions.main())

          } else {
            Alert.alert("Chyba", "Chyba pri registrácii, skontrolujte znovu svoje údaje alebo kontaktujte podporu");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: 'https://bombuj.tv/android_api/unigram/images/unigrambg.png' }} style={styles.image}>
          <Text style={styles.registerText}>Registrácia</Text>
          <WhiteBox>
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10 }}
              onChangeText={firstname => this.setState({ firstname })}
              placeholderTextColor={"grey"}
              returnKeyType="next"
              placeholder={'Firstname'}
            />
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              onChangeText={surname => this.setState({ surname })}
              placeholder={'Surname'}
              placeholderTextColor={"grey"}
              returnKeyType="next"
            />
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              placeholder={'E-Mail'}
              onChangeText={email => this.setState({ email })}
              textContentType={'emailAddress'}
              placeholderTextColor={"grey"}
              returnKeyType="next"
            />
            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              placeholder={'Password'}
              onChangeText={pass => this.setState({ pass })}
              secureTextEntry={true}
              placeholderTextColor={"grey"}
              returnKeyType="next"
            />

            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              placeholder={'University'}
              onChangeText={university => this.setState({ university })}
              placeholderTextColor={"grey"}
              returnKeyType="next"
            />

            <TextInput
              style={{ height: 40, padding: 5, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15 }}
              placeholder={'Faculty / College'}
              onChangeText={faculty => this.setState({ faculty })}
              placeholderTextColor={"grey"}
              returnKeyType="done"
            />

            <RadioForm
              radio_props={radio_props}
              initial={0}
              buttonColor={"#A41034"}
              buttonInnerColor={"#A41034"}
              buttonSize={15}
              buttonWrapStyle={{ marginLeft: 10 }}
              selectedButtonColor={"#A41034"}
              labelStyle={{ marginRight: 10 }}
              formHorizontal={true}
            />
            <Text style={{ color: 'gray', fontSize: 10, marginBottom: 15 }}>Clicking on Create accoutn button you agree to our terms of use and privacy policy</Text>
            <Button title={"Create account"} color={"#A41034"} onPress={this.register}></Button>
            <View style={{ margin: 5 }} />
            <Button title={"Log in"} color={"#A41034"} onPress={goToLogin}></Button>

          </WhiteBox>
        </ImageBackground>
      </View>
    )
  }
}
export default Register

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    color: 'white',
  },
  whiteBox: {
    marginTop: 30,
    width: '80%',
    height: 200,
  },
  registerText: {
    fontWeight: 'bold',
    fontSize: 35,
    textAlign: 'center',
    color: '#fff',
  },
});
