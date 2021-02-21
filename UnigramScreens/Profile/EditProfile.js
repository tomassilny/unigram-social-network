import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, StatusBar, Button, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PropTypes from 'prop-types';
import { TouchableOpacity, ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'

const options = {
    title: 'Upraviť profilovku',
    takePhotoButtonTitle: 'Ofotiť fotografiu',
    chooseFromLibraryButtonTitle: 'Nahrať obrázok z knižnice',
}

class EditProfile extends React.Component {
    state = {
        userID: null,
        name: null,
        surname: null,
        email: null,
        university: null,
        faculty: null,
        photo: null,
        photoData: null,
        photoAddress: null
    };

    constructor(props) {
        super(props);
    }

    goToProfile() {
        this.props.handleApplyChanges();
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
        this.setState({
            name: this.props.userDatas.firstname,
            surname: this.props.userDatas.surname,
            email: this.props.userDatas.email,
            bio: this.props.userDatas.bio,
            photo: this.props.userDatas.profile_picture,
            university: this.props.userDatas.university,
            faculty: this.props.userDatas.faculty
        });
    }

    goToChangePassword = () => {
        Actions.change_password();
    }

    openImagePicker = () => {
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('Image Picker Error: ', response.error);
            }

            else {
                let source = { uri: response.uri };

                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    photo: response.uri,
                    photoData: response.data
                });
            }
        });
    }

    uploadToServer() {
        let change = true;

        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.email) === false) {
            Alert.alert("Upozornenie", "Nesprávny fomát E-Mailu");
            change = false;
        }

        if (this.state.name == '' || this.state.surname == '' || this.state.email == '') {
            Alert.alert("Upozornenie", "Musíte vyplniť všetky polia");
            change = false;
        }

        if (change) {

            fetch('https://wawier.com/unigram/profile/updateprofile.php?name=' + this.state.name
                + "&surname=" + this.state.surname + "&email=" + this.state.email + "&bio=" + this.state.bio
                + "&user_id=" + this.state.userID + (this.state.photoAddress != null ? "&profile_picture=" + this.state.photoAddress : "&profile_picture=null")
                + "&faculty=" + this.state.faculty + "&university=" + this.state.university, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.id > 0) {
                        Alert.alert("Oznam", "Zmeny uložené");
                        this.goToProfile();
                    } else {
                        Alert.alert("Chyba", "Chyba pri ukladaní zmien, skúste to znovu");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    publish = () => {
        Alert.alert("Oznam", "Prebieha ukladanie údajov");
        // If also change profile picture
        if (this.state.photoData != null) {
            const rand = 100000 + Math.random() * (10000000 - 100000);

            let date = new Date();

            let day = date.getDay()
            let month = date.getMonth()
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();

            let d = "" + day + month + year + hours + minutes + seconds
            let imageName = d + "_" + parseInt(rand) + "_" + 'profile_image.png';


            RNFetchBlob.fetch('POST', 'https://wawier.com/unigram/profile/upload_profile_picture.php', {
                Authorization: "Bearer access-token",
                otherHeader: "foo",
                'Content-Type': 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name: 'image', filename: imageName, type: 'image/png', data: this.state.photoData }

            ]).then((resp) => {
                console.log(resp);
                this.setState({ photoAddress: imageName }, () => this.uploadToServer());
                this.uploadToServer();
            }).catch(e => {
                alert(e);
            });
        } else {
            this.uploadToServer();
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
                                <Text style={{ color: "grey", textAlign: "center", marginBottom: 15 }}>Uvádzajte vždy len svoje pravdivé informácie a nezverejňujte obsah, ktorý by porušoval podmienky používania našej komunity</Text>
                                {this.state.photo == null ?
                                    <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={80} height={80} />
                                    :
                                    <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.state.photo }} width={80} height={80} />

                                }
                                <View style={{ width: "60%", marginTop: 10 }}>
                                    <Button onPress={this.openImagePicker} style={{ marginTop: 50 }} color={"#A41034"} title="Zmeniť fotku"></Button>
                                </View>

                                <View style={{ width: '100%', marginTop: 10, marginBottom: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>

                                <View style={{ width: "60%" }}>
                                    <Text style={styles.header}>Meno</Text>
                                    <TextInput
                                        onChangeText={value => this.setState({ name: value })}
                                        maxLength={20} style={styles.input} value={this.state.name} width={"100%"}></TextInput>
                                    <Text style={styles.header}>Priezvisko</Text>
                                    <TextInput
                                        onChangeText={surname => this.setState({ surname })}
                                        maxLength={20} style={styles.input} value={this.state.surname} width={"100%"}></TextInput>
                                    <Text style={styles.header}>E-Mail</Text>
                                    <TextInput
                                        onChangeText={email => this.setState({ email })}
                                        maxLength={80} style={styles.input} value={this.state.email} width={"100%"}></TextInput>
                                    <Text style={styles.header}>Univerzita</Text>
                                    <TextInput
                                        onChangeText={university => this.setState({ university })}
                                        maxLength={80} style={styles.input} value={this.state.university} width={"100%"}
                                    />
                                    <Text style={styles.header}>Fakulta</Text>
                                    <TextInput
                                        onChangeText={faculty => this.setState({ faculty })}
                                        maxLength={80} style={styles.input} value={this.state.faculty} width={"100%"}
                                    />

                                    <Text style={styles.header}>Bio (text v profile)</Text>
                                    <TextInput
                                        placeholder={"Môžete sem napísať napríklad informácie o sebe, ktoré sa zobrazia vo Vašom profile"}
                                        maxLength={300}
                                        onChangeText={bio => this.setState({ bio })}
                                        value={this.state.bio}
                                        textAlignVertical={"top"}
                                        style={styles.input}
                                        multiline={true}
                                        returnKeyType='default'
                                        height={100}
                                        width={"100%"}>
                                    </TextInput>

                                    <View style={{ width: "100%", marginBottom: 10 }}>
                                        <Button onPress={this.publish} style={{ marginTop: 15 }} color={"#A41034"} title="Uložiť zmeny"></Button>
                                    </View>

                                </View>

                                <View style={{ width: '100%', marginTop: 10, marginBottom: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>

                                <View style={{ width: "60%" }}>
                                    <Button onPress={this.goToChangePassword} style={{ marginTop: 15 }} color={"#A41034"} title="Zmeniť heslo"></Button>
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

EditProfile.propTypes = {
    userDatas: PropTypes.object.isRequired
};
export default EditProfile

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
        padding: (Platform.OS === 'ios') ? 10 : 3, borderRadius: 5, borderWidth: 1, borderColor: "#ccc", marginBottom: 10
    },
    picker: {
        padding: 0,
    }
});