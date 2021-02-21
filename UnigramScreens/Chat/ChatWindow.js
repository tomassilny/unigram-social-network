import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, Alert, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import Modal from 'react-native-modal';

const options = {
    title: 'Odoslať fotografiu',
    takePhotoButtonTitle: 'Ofotiť fotografiu',
    chooseFromLibraryButtonTitle: 'Nahrať obrázok z knižnice',
}

class Chat extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        userID: null,
        posts: null,
        message: '',
        messages: null,
        messagesTemp: null,
        photo: null,
        photoData: null,
        photoAddress: null,
        imageModalVisible: false,
        clickedImage: null
    };

    openImagePicker = (source) => {
        if (source == "camera") {
            ImagePicker.launchCamera(options, (response) => {
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
                    }, () => this.publishImage());
                }
            });
        } else {
            ImagePicker.launchImageLibrary(options, (response) => {
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
                    }, () => this.publishImage());
                }
            });
        }
    }

    uploadToServer() {
        // If is not group - is dialog
        if (!this.props.groupId > 0) {
            fetch('https://wawier.com/unigram/chat/insertmessage.php?from_user=' + this.props.fromUser + '&to_user=' + this.props.toUser + '&media=' + this.state.photoAddress, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.id > 0) {
                        this.getMessages();
                    } else {
                        Alert.alert("Chyba", "Chyba pri odosielaní obrázku, skúste zo znovu");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            // If is group
            fetch('https://wawier.com/unigram/chat/insertgroupmessage.php?from_user=' + this.props.fromUser + '&groupId=' + this.props.groupId + '&media=' + this.state.photoAddress, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.id > 0) {
                        this.getMessages();
                    } else {
                        Alert.alert("Chyba", "Chyba pri odosielaní obrázku, skúste zo znovu");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    publishImage = () => {
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
            let imageName = d + "_" + parseInt(rand) + "_" + 'chat_image.png';


            RNFetchBlob.fetch('POST', 'https://wawier.com/unigram/chat/upload_image.php', {
                Authorization: "Bearer access-token",
                otherHeader: "foo",
                'Content-Type': 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name: 'image', filename: imageName, type: 'image/png', data: this.state.photoData }

            ]).then((resp) => {
                this.setState({ photoAddress: imageName }, () => this.uploadToServer());
            }).catch(e => {
                alert(e);
            });
        } else {
            Alert.alert("Chyba", "Vyskytla sa chyba. Skúste zo znovu")
        }
    }

    showActionSheet = () => {
        this.ActionSheet.show();
    };

    sendMessage() {

        if (this.state.message != '') {
            // If is dialog (not group)
            if (!this.props.groupId > 0) {
                fetch('https://wawier.com/unigram/chat/insertmessage.php?from_user=' + this.props.fromUser + '&to_user=' + this.props.toUser + '&message=' + this.state.message, {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        this.setState(() => ({
                            message: '',
                        }));
                        this.getMessages();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                fetch('https://wawier.com/unigram/chat/insertgroupmessage.php?from_user=' + this.props.fromUser + '&groupId=' + this.props.groupId + '&message=' + this.state.message, {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        this.setState(() => ({
                            message: '',
                        }));
                        this.getMessages();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    }

    downloadImage(uri) {
        let newImgUri = uri.lastIndexOf('/');
        let imageName = uri.substring(newImgUri);

        let dirs = RNFetchBlob.fs.dirs;
        let path = Platform.OS === 'ios' ? dirs['MainBundleDir'] + imageName : dirs.PictureDir + imageName;

        if (Platform.OS == 'android') {
            RNFetchBlob.config({
                fileCache: true,
                appendExt: 'png',
                indicator: true,
                IOSBackgroundTask: true,
                path: path,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: path,
                    description: 'Image'
                },

            }).fetch("GET", uri).then(res => {
                Alert.alert("Obrázok stiahnutý", "Obrázok úspešne stiahnutý a uložený do galérie")
            });
        } else {
            CameraRoll.saveToCameraRoll(uri);
        }
    }

    getMessages() {
        if (this.props.group) {
            fetch('https://wawier.com/unigram/chat/getgroupmessages.php?group_id=' + this.props.groupId, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState(() => ({
                        messages: responseJson,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            fetch('https://wawier.com/unigram/chat/getmessages.php?from_user=' + this.props.fromUser + "&to_user=" + this.props.toUser, {
                method: 'GET'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState(() => ({
                        messages: responseJson,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    getMessagesTemp() {
        fetch('https://wawier.com/unigram/chat/getmessages.php?from_user=' + this.props.fromUser + "&to_user=" + this.props.toUser, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    messagesTemp: responseJson,
                }), () => {
                    // Refresh messages only if messages has some new messages
                    if (this.state.messages != this.state.messagesTemp) {
                        this.getMessages();
                    }
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    componentDidMount() {
        this.getMessages();
        this.timer = setInterval(() => this.getMessagesTemp(), 3000)
    }

    componentWillUnmount(){
        clearInterval(this.timer);
    }

    render() {
        var optionArray = [
            'Vybrať fotografiu',
            'Odfotiť fotografiu a odoslať',
            'Zrušiť',
        ];
        return (
            <View style={{ backgroundColor: "#fff", flex: 1 }}>

                <Modal style={{ justifyContent: "center" }}
                    isVisible={this.state.imageModalVisible}
                    onSwipeComplete={() => this.setState({ imageModalVisible: false })}
                    swipeDirection="down"
                    animationIn="slideInUp"
                >
                    <View style={{ width: "100%", height: "95%", borderRadius: 15 }}>
                        <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                        </View>
                        <View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity>
                                    <Icon name='angle-down' size={35} style={{ alignSelf: 'flex-end' }} color={'white'} onPress={() => { this.setState({ imageModalVisible: false }) }}></Icon>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 12 }} onPress={() => this.downloadImage('https://wawier.com/unigram/chat/images/' + this.state.clickedImage)}>
                                    <Icon name='download' size={20} color={'white'}></Icon>
                                </TouchableOpacity>
                            </View>
                            <Image source={{ uri: 'https://wawier.com/unigram/chat/images/' + this.state.clickedImage }} style={{ width: "100%", height: 500, maxHeight: 500, marginTop: 10 }}></Image>
                        </View>
                    </View>
                </Modal>

                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    options={optionArray}
                    cancelButtonIndex={optionArray.length - 1}
                    destructiveButtonIndex={optionArray.length - 1}
                    onPress={index => {
                        switch (index) {
                            case 0:
                                this.openImagePicker();
                                break;
                            case 1:
                                this.openImagePicker("camera");
                                break;
                        }
                    }}
                />

                <View style={{ height: "90%" }}>
                    {this.state.messages != null ?
                        <View style={{ flex: 1 }}>
                            {this.state.messages.length > 0 ?
                                <FlatList
                                    ItemSeparatorComponent={this.separator}
                                    data={this.state.messages}
                                    inverted={true}
                                    showsVerticalScrollIndicator={false}
                                    keyExtractor={(item, index) => {
                                        return item.id;
                                    }}
                                    renderItem={({ item }) =>
                                        <View>
                                            {!(item.message.length > 0) ?
                                                <View style={styles.message}>
                                                    {item.from_user == this.props.fromUser ?
                                                        <View>
                                                            <TouchableOpacity onPress={() => this.setState({ clickedImage: item.media, imageModalVisible: true })}>
                                                                <Image source={{ uri: "https://wawier.com/unigram/chat/images/" + item.media }} style={styles.myImage} />
                                                            </TouchableOpacity>
                                                            <Text style={styles.date}>{item.datetext}</Text>
                                                        </View>
                                                        :
                                                        <View>
                                                            <TouchableOpacity onPress={() => this.setState({ clickedImage: item.media, imageModalVisible: true })}>
                                                                <Image source={{ uri: "https://wawier.com/unigram/chat/images/" + item.media }} style={styles.otherImage} />
                                                            </TouchableOpacity>
                                                            <Text style={styles.dateOther}>{item.datetext}</Text>
                                                        </View>
                                                    }
                                                </View>
                                                :
                                                <View style={styles.message}>
                                                    {item.from_user == this.props.fromUser ?
                                                        <View>
                                                            <View style={styles.myMessage}>
                                                                <Text style={{ color: "#fff" }}>{item.message}</Text>
                                                            </View>
                                                            {this.props.group ?
                                                                <Text style={styles.date}>{item.fullname}&nbsp;•&nbsp;{item.datetext}</Text>
                                                                :
                                                                <Text style={styles.date}>{item.datetext}</Text>

                                                            }
                                                        </View>
                                                        :
                                                        <View>
                                                            <View style={styles.otherMessage}>
                                                                <Text style={{ color: "#212121" }}>{item.message}</Text>
                                                            </View>
                                                            {this.props.group ?
                                                                <Text style={styles.dateOther}>{item.fullname}&nbsp;•&nbsp;{item.datetext}</Text>
                                                                :
                                                                <Text style={styles.dateOther}>{item.datetext}</Text>
                                                            }
                                                        </View>
                                                    }
                                                </View>
                                            }
                                        </View>
                                    }
                                />
                                :
                                <Text style={{ alignSelf: 'center', marginTop: 40, marginBottom: 40, color: 'grey', textAlign: "center" }}>
                                    <Icon name={"send"} size={50} />{'\n\n'}
              Zatiaľ žiadne správy.</Text>
                            }
                        </View>
                        :
                        <View>
                            <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                        </View>
                    }
                </View>
                <View style={styles.sendBlock}>
                    <TouchableOpacity onPress={this.showActionSheet}>
                        <Icon name={"plus"} size={28} color={"grey"} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder={"Napíšte správu..."}
                        style={styles.input}
                        value={this.state.message}
                        onChangeText={(message) => this.setState({ message })}
                        multiline={true}
                        maxLength={1000}
                    >
                    </TextInput>
                    <TouchableOpacity onPress={() => this.sendMessage()}>
                        <Icon name={"send"} size={26} color={"#A41034"} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export default Chat

const styles = StyleSheet.create({
    sendBlock: {
        padding: 10,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#f1f1f1",
        borderTopColor: "#E0E0E0",
        flex: 1,
        borderTopWidth: 1,
    },
    date: {
        color: "grey",
        fontSize: 12,
        marginLeft: 10
    },
    myImage: {
        backgroundColor: "#A41034",
        width: 200,
        height: 200,
        alignSelf: "flex-start",
        maxWidth: 250,
        backgroundColor: "#A41034",
        padding: 10,
        borderRadius: 20,
    },
    otherImage: {
        backgroundColor: "#f0f0f0",
        width: 200,
        height: 200,
        alignSelf: "flex-end",
        maxWidth: 250,
        backgroundColor: "#A41034",
        padding: 10,
        borderRadius: 20,
    },
    dateOther: {
        color: "grey",
        fontSize: 12,
        marginRight: 10,
        alignSelf: "flex-end"
    },
    message: {
        marginLeft: 10,
        marginBottom: 10,
        marginRight: 10
    },
    myMessage: {
        alignSelf: "flex-start",
        maxWidth: 250,
        backgroundColor: "#A41034",
        padding: 10,
        borderRadius: 20,

    },
    otherMessage: {
        alignSelf: "flex-end",
        maxWidth: 250,
        backgroundColor: "#f0f0f0",
        padding: 10,
        borderRadius: 20,
    },
    input: {
        margin: 10,
        width: "80%",
        height: 40,
        backgroundColor: "#fff",
        padding: 5,
        borderRadius: 15,
        elevation: 1,
    }
});