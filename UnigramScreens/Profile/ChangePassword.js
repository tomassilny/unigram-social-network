import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, StatusBar, Button, Picker, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PropTypes from 'prop-types';
import { TouchableOpacity, ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'

class ChangePassword extends React.Component {
    state = {
        userID: null,
        oldPass: null,
        newPass: null,
        repeatPass: null
    };

    constructor(props) {
        super(props);
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            if (this.props.userID == null) {
                this.setState({ userID: id });
            }

        } catch (e) {
        }
    }

    componentDidMount() {
        this.getActualUserID();
    }

    changePass = () => {        
        if (this.state.newPass != null) {            
            if ((this.state.newPass == this.state.repeatPass) && (this.state.newPass.length > 7)) {
                fetch('https://wawier.com/unigram/profile/changepassword.php?user_id=' + this.state.userID + "&old_pass=" + this.state.oldPass + "&new_pass=" + this.state.newPass, {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if (responseJson.id > 0) {
                            Alert.alert("Oznam", "Heslo úspešne zmenené");
                        } else {
                            Alert.alert("Chyba", "Chyba pri zmene hesla, skúste zo znova");
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                Alert.alert("Chyba", "Heslá sa nezhodujú alebo nové heslo je príliš krátke");
            }
        }else{
            Alert.alert("Chyba", "Vyplňte prosím všetky polia");
        }
    }

    render() {
        return (
            <View>
                <StatusBar backgroundColor="#A41034" barStyle="light-content" />

                {this.state.userID != null ?
                    <View>
                        <ScrollView>
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <Text style={{ color: "grey", textAlign: "center", marginBottom: 15 }}>Heslo musí obsahovať minimálne 8 znakov, odporúčame použiť v hesle číslice a špeciálne znaky</Text>

                                <View style={{ width: '100%', marginTop: 10, marginBottom: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>

                                <View style={{ width: "60%" }}>
                                    <Text style={styles.header}>Staré heslo</Text>
                                    <TextInput secureTextEntry={true}
                                        onChangeText={oldPass => this.setState({ oldPass })}
                                        maxLength={20} style={styles.input} width={"100%"}></TextInput>

                                    <Text style={styles.header}>Nové heslo</Text>
                                    <TextInput secureTextEntry={true}
                                        onChangeText={newPass => this.setState({ newPass })}
                                        maxLength={20} style={styles.input} width={"100%"}></TextInput>

                                    <Text style={styles.header}>Zopakujte nové heslo</Text>
                                    <TextInput secureTextEntry={true}
                                        onChangeText={repeatPass => this.setState({ repeatPass })}
                                        maxLength={20} style={styles.input} width={"100%"}></TextInput>

                                    <Button onPress={this.changePass} style={{ marginTop: 15 }} color={"#A41034"} title="Uložiť zmeny"></Button>
                                </View>

                            </View>
                        </ScrollView>

                    </View>

                    :
                    <View>
                        <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                    </View>
                }
            </View>
        )
    }
}

export default ChangePassword

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
    header: {
        fontWeight: "bold",
        marginBottom: 5,
        fontSize: 14
    },
    input: {
        padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "#ccc", marginBottom: 10
    },
    picker: {
        padding: 0,
    }
});