import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from 'react-native'
import AuthService from '../../../services/auth-service'
import Indicator from '../../components/indicator'
import { showAlert } from '../../../helpers/alert'
import ImgPicker from '../../components/imgPicker'

export default class Settings extends Component {

  constructor(props) {
    super(props)
    const user = props.navigation.getParam('user')
    this.state = {
      isLoader: false,
      login: user.login,
      name: user.full_name
    }
  }

  isPickImage = null

  pickPhoto = (image) => {
    this.isPickImage = image
  }


  onSaveProfile = () => {
    const user = this.props.navigation.getParam('user')
    const { login, name } = this.state
    this.refs.input.blur()
    const newData = {}
    if (user.full_name !== name) {
      newData.full_name = name
    }
    if (user.login !== login) {
      newData.login = login
    }
    if (this.isPickImage) {
      newData.image = this.isPickImage
    }
    if (Object.keys(newData).length === 0) {
      return
    }
    this.setState({ isLoader: true })
    AuthService.updateCurrentUser(newData)
      .then(() => {
        this.setState({ isLoader: false })
        showAlert('User profile is updated successfully')
      })
      .catch((error) => {
        this.setState({ isLoader: false })
        showAlert(error)
      })
  }

  userLogout = () => {
    const { navigation } = this.props
    Alert.alert(
      'Naozaj sa chcete odhlásiť?',
      '',
      [
        {
          text: 'Áno',
          onPress: () => {
            navigation.navigate('Auth')
            AuthService.logout()
          }
        },
        {
          text: 'Zrušiť'
        }
      ],
      { cancelable: false }
    )
  }

  updateLogin = login => this.setState({ login })

  updateName = name => this.setState({ name })

  render() {
    const { isLoader, name, login, } = this.state
    const user = this.props.navigation.getParam('user')
    return (
      <KeyboardAvoidingView style={styles.container}>
        {isLoader &&
          <Indicator size={40} color={'blue'} />
        }
        <ImgPicker name={user.full_name} photo={user.avatar} pickPhoto={this.pickPhoto} />
        <View>
          <TouchableOpacity onPress={this.userLogout}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonLabel}>Odhlásiť sa</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    marginTop: 40,
    height: 50,
    width: 200,
    borderRadius: 25,
    backgroundColor: '#A41034',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700'
  },
  buttonContainerSave: {
    height: 50,
    width: 200,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#A41034',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabelSave: {
    color: '#A41034',
    fontSize: 20,
    fontWeight: '700'
  },
  inputWrap: {
    marginVertical: 20
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: 200,
    marginVertical: 15,
    padding: 7,
    paddingTop: 15,
    fontSize: 17
  },
  subtitleInpu: {
    color: 'grey'
  },
  subtitleWrap: {
    position: 'absolute',
    marginVertical: -7,
    bottom: 0,
  }
})
