import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import KeyboardListener from 'react-native-keyboard-listener';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'

const options = {
    title: 'Upraviť profilovku',
    takePhotoButtonTitle: 'Ofotiť fotografiu',
    chooseFromLibraryButtonTitle: 'Nahrať obrázok z knižnice',
}

class CreateGroup extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        groupName: '',
        groupUsers: [],
        query: '',
        results: null,
        userID: null,
        tipsVisible: false,
        photo: null,
        photoData: null,
        photoAddress: null,
        message: '',
    };

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            // if this is profile of logged user (himself)
            this.setState({ userID: id });

        } catch (e) {
        }
    }

    getFullnameAndInsertData(id) {
        fetch('https://wawier.com/unigram/chat/getfullname.php?user_id=' + id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                var groupUsers = this.state.groupUsers;

                groupUsers.push(responseJson)
                this.setState({ groupUsers: groupUsers });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getGroupData() {
        fetch('https://wawier.com/unigram/chat/getgroupdata.php?group_id=' + this.props.groupId, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let arr = responseJson.users.split(',');
                // Get user names based on ids of users
                arr.forEach(element => {
                    this.getFullnameAndInsertData(element);
                });
                this.setState({
                    groupName: responseJson.name,
                    photoAddress: responseJson.group_image
                })
            })
            .catch((error) => {
                console.error(error);
                this.setState({ loading: false });
            });
    }

    componentDidMount() {
        this.getActualUserID();
        if (this.props.groupId > 0) {
            this.getGroupData();
        }
    }

    search() {
        this.setState({ loading: true });
        fetch('https://wawier.com/unigram/search/search.php?q=' + this.state.query + "&offset=0&user_id=" + this.state.userID, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    results: responseJson,
                    loading: false
                }));
            })
            .catch((error) => {
                console.error(error);
                this.setState({ loading: false });
            });
    }

    updateSearch = (query) => {
        this.setState({ query: query, tipsVisible: true }, () => this.search());
    };

    separator() {
        return (
            <View style={{ flex: 1, marginTop: 5, marginBottom: 5 }}></View>
        );
    }

    Person(id, fullname) {
        this.id = id;
        this.fullname = fullname;
    }

    addPerson(id, fullname) {
        var isOkay = true;
        this.state.groupUsers.forEach(element => {
            if (element.id == id) {
                isOkay = false;
            }
        });

        if (isOkay) {
            var person = new this.Person(id, fullname);
            var groupUsers = this.state.groupUsers;

            groupUsers.push(person)
            this.setState({ groupUsers: groupUsers });
            console.log(this.state.groupUsers);
        }
    }

    deletePerson(id) {
        let arr = this.state.groupUsers;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == id) {
                arr.splice(i, 1);
                break;
            }
        }
        this.setState({ groupUsers: arr });
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

        if (this.state.groupUsers.length < 2) {
            change = false;
            Alert.alert("Chyba", "Pre vytvorenie skupiny potrebujete pridať aspoň dvoch ľudí");
        }

        if (this.state.groupName.length < 1) {
            change = false;
            Alert.alert("Chyba", "Názov skupiny nesmie byť prázdny");
        }

        if (this.state.message == '' && !this.props.groupId > 0) {
            change = false;
            Alert.alert("Chyba", "Položka Správa nesmie byť prázdna");
        }

        if (change) {

            let groupUsersString = '';
            if (!this.props.groupId > 0) {
                groupUsersString = this.state.userID + ',';
            }
            this.state.groupUsers.forEach(element => {
                groupUsersString += element.id + ",";
            });
            groupUsersString = groupUsersString.substring(0, groupUsersString.length - 1);

            // If group we have to create new
            if (!this.props.groupId > 0) {
                fetch('https://wawier.com/unigram/chat/creategroup.php?name=' + this.state.groupName
                    + "&profile_picture=" + this.state.photoAddress + "&users=" + groupUsersString + "&message=" + this.state.message
                    + "&from_user=" + this.state.userID, {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if (responseJson.id > 0) {
                            Alert.alert("Oznam", "Zmeny uložené");
                        } else {
                            Alert.alert("Chyba", "Chyba pri ukladaní zmien, skúste to znovu");
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                // If group we need to edit / change not to create new then     
                fetch('https://wawier.com/unigram/chat/editgroup.php?name=' + this.state.groupName
                    + "&profile_picture=" + this.state.photoAddress + "&users=" + groupUsersString, {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if (responseJson.id > 0) {
                            Alert.alert("Oznam", "Zmeny uložené");
                        } else {
                            Alert.alert("Chyba", "Chyba pri ukladaní zmien, skúste to znovu");
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
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
            let imageName = d + "_" + parseInt(rand) + "_" + 'group_image.png';


            RNFetchBlob.fetch('POST', 'https://wawier.com/unigram/chat/upload_group_image.php', {
                Authorization: "Bearer access-token",
                otherHeader: "foo",
                'Content-Type': 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name: 'image', filename: imageName, type: 'image/png', data: this.state.photoData }

            ]).then((resp) => {
                console.log(resp);
                this.setState({ photoAddress: imageName }, () => this.uploadToServer());
            }).catch(e => {
                alert(e);
            });
        } else {
            this.uploadToServer();
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: "#f1f1f1", flex: 1 }}>
                <KeyboardListener
                    onDidHide={() => { this.setState({ tipsVisible: false }); }}
                />
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={styles.block}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                            {this.props.groupId > 0 ?
                                <Text style={styles.header}>Skupina: {this.state.groupName}</Text>
                                :
                                <Text style={styles.header}>Vytvoriť skupinu</Text>
                            }
                        </View>
                        <TextInput
                            value={this.state.groupName}
                            onChangeText={(groupName) => this.setState({ groupName })}
                            style={styles.input}
                            maxLength={20}
                            placeholder={"Názov skupiny"}
                        >
                        </TextInput>

                        {this.state.tipsVisible &&
                            <View style={styles.tipsBox}>
                                <FlatList
                                    keyboardShouldPersistTaps={'handled'}
                                    data={this.state.results}
                                    ItemSeparatorComponent={this.separator}
                                    keyExtractor={(item, index) => {
                                        return item.id;
                                    }}
                                    renderItem={({ item }) =>
                                        <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 18 }}>
                                            <TouchableOpacity onPress={() => this.addPerson(item.id, item.name + " " + item.surname)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {(item.profile_picture == null || item.profile_picture == 'null') ?
                                                    <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={40} height={40} />
                                                    :
                                                    <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + item.profile_picture }} width={40} height={40} />
                                                }
                                                <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{item.name} {item.surname}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                />
                            </View>
                        }

                        <TextInput
                            value={this.state.query}
                            onChangeText={this.updateSearch}
                            style={styles.input}
                            placeholder={"Napíšte mená osôb, ktoré chcete pridať do chatu"}
                        >
                        </TextInput>

                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {this.state.groupUsers.map((item, index) => {
                                return (
                                    <TouchableOpacity onPress={() => this.deletePerson(item.id)}>
                                        <View style={styles.userSelected}>
                                            <Text style={styles.userText}>{item.fullname}&nbsp;<Icon name='remove' color={'white'}></Icon>
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        {!this.state.groupName != '' &&
                            <TextInput
                                onChangeText={(message) => this.setState({ message })}
                                style={styles.input}
                                multiline={true}
                                maxLength={500}
                                placeholder={"Správa"}
                            >
                            </TextInput>
                        }

                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            {this.state.photo == null ?  
                                <View>
                                    {(this.state.photoAddress != null || this.state.photoAddress != 'null') ?
                                        <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/chat/group_images/" + this.state.photoAddress }} width={80} height={80} />
                                        :
                                        <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={80} height={80} />
                                    }
                                </View>
                                :
                                <Image style={styles.avatar} source={{ uri: this.state.photo }} width={80} height={80} />
                            }
                            <View style={{ width: "60%", marginTop: 10, alignSelf: "center" }}>
                                <Button onPress={this.openImagePicker} style={{ marginTop: 50 }} color={"#A41034"} title="Zmeniť fotku chatu"></Button>
                            </View>
                        </View>

                        <View style={{ width: "100%", marginTop: 20 }}>
                            {this.props.groupId > 0 ?
                                <Button onPress={this.publish} style={{ marginTop: 15 }} color={"#A41034"} title="Uložiť zmeny"></Button>
                                :
                                <Button onPress={this.publish} style={{ marginTop: 15 }} color={"#A41034"} title="Vytvoriť skupinu"></Button>
                            }
                        </View>

                    </View>
                </ScrollView>
            </View>
        )
    }
}

export default CreateGroup

const styles = StyleSheet.create({
    input: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#f4f4f4",
        borderWidth: 1,
        borderColor: "#f1f1f1",
        elevation: 1,
        borderRadius: 15
    },
    userSelected: {
        marginTop: 5,
        padding: 7,
        borderRadius: 15,
        marginRight: 5,
        backgroundColor: "#A41034"
    },
    userText: {
        color: "#fff",
        alignSelf: "center"
    },
    tipsBox: {
        position: "absolute",
        width: "110%",
        height: 135,
        backgroundColor: "#f9f9f9",
        elevation: 2,
    },
    block: {
        marginTop: 15,
        width: "95%",
        padding: 20,
        flex: 1,
        borderRadius: 10,
        backgroundColor: "white",
        elevation: 3,
        alignSelf: "center",
        marginBottom: 10
    },
    header: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 10,
        alignSelf: "flex-start"
    },
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
});
