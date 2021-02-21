import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage'
import KeyboardListener from 'react-native-keyboard-listener';

let data = new FormData();
let pattern = new RegExp("@[a-zA-z][^,]*$");

const options = {
  title: 'Add image',
  takePhotoButtonTitle: 'Take photo',
  chooseFromLibraryButtonTitle: 'Upload image from library',
}


class AddPost extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    text: '',
    showingText: '',
    medias: '',
    data: '',
    postAdded: false,
    photos: [],
    results: null,
    photosData: [],
    isDisabled: false,
    userID: null,
    findPatt: false,
    tipsVisible: false,
    query: null,
  };

  async getActualUserID() {
    try {
      const id = await AsyncStorage.getItem("@id");
      if (id !== null) {
        this.setState({ userID: id })
      }
    } catch (e) {
    }
  }

  componentDidMount() {
    this.getActualUserID();
  }

  uploadToServer() {
    if (this.state.text == '' && !(this.state.photos.length > 0)) {
      Alert.alert("Chyba", "Chyba pri pridávaní príspevku");
    } else {
      // Publish post
      fetch('https://wawier.com/unigram/posts/add.php?author_id=' + this.state.userID + '&text=' + this.state.text + '&medias=' + this.state.medias, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          this.setState({
            data: responseJson
          })
          console.log(this.state.text);


          const { data } = this.state;

          if (data.id > 0) {
            this.setState({ postAdded: true })
            Alert.alert("Info", "Príspevok úspešne pridaný");
            this.setState({ isDisabled: false });
            RNRestart.Restart();
          } else {
            Alert.alert("Chyba", "Chyba pri pridávaní príspevku. Skúste to znovu");
            this.setState({ isDisabled: false });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  publishPost = () => {
    this.setState({ isDisabled: true });

    Alert.alert("Info", "Prebieha pridávania príspevku...");

    if (this.state.photos.length == 0) {
      this.uploadToServer();
    }

    // Add images
    for (let i = 0; i < this.state.photos.length; i++) {

      // Upload medias on server if exists
      if (this.state.photos.length > 0) {
        const rand = 100000 + Math.random() * (10000000 - 100000);

        let date = new Date();

        let day = date.getDay()
        let month = date.getMonth()
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        let d = "" + day + month + year + hours + minutes + seconds
        let imageName = d + "_" + parseInt(rand) + "_" + i + 'image.png';


        RNFetchBlob.fetch('POST', 'https://wawier.com/unigram/posts/upload.php', {
          Authorization: "Bearer access-token",
          otherHeader: "foo",
          'Content-Type': 'multipart/form-data',
        }, [
          // element with property `filename` will be transformed into `file` in form data
          { name: 'image', filename: imageName, type: 'image/png', data: this.state.photosData[i] }

        ]).then((resp) => {
          console.log(resp);

          // Set medias to string          
          let medias = this.state.medias;
          medias += imageName;


          if (i < this.state.photos.length - 1) {
            medias += ';';
          }

          this.setState({ medias: medias });


          if (i == this.state.photos.length - 1) {
            this.uploadToServer();
          }
        }).catch(e => {
          alert(e);
        });
      }
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

        let photos = this.state.photos;
        photos.push(response.uri);

        let photosData = this.state.photosData;
        photosData.push(response.data);

        this.setState({
          photos: photos,
          photosData: photosData
        });
      }
    });
  }

  separator() {
    return (
      <View style={{ flex: 1, marginTop: 5, marginBottom: 5 }}></View>
    );
  }

  changeText = (text) => {
    this.setState({ text: text, showingText: text });
    if (pattern.test(text)) {
      let query = String(text.match(pattern)).replace('@', '');
      this.setState({ tipsVisible: true, query: query }, () => {
        this.search();
      })
    }


    var qualityRegex = /{{(.*?)}}/g,
      matches,
      qualities = [];

    while (matches = qualityRegex.exec(this.state.text)) {
      qualities.push(decodeURIComponent(matches[1]));
    }

    let editedTxt = this.state.showingText;
    qualities.forEach(element => {
      let arr = element.split(",");
      editedTxt = editedTxt.replace("{{" + element + "}}", arr[1]);
    });
    console.log(editedTxt);

  }

  addPerson = (id, fullname) => {
    let txt = this.state.text;
    txt = txt.replace("@" + this.state.query, '');
    this.setState({ text: txt }, () => {
      // UROBIT AKO TEXTTOSAVE A NORMALNY TEXT
      this.setState({
        text: this.state.text + "{{" + id + "," + fullname + "}}",
        query: '',
        showingText: this.state.text + "{{" + id + "," + fullname + "}}",
        tipsVisible: false
      })

    });
  }

  render() {
    return (
      <View style={{ padding: 25 }}>
        <KeyboardListener
          onDidHide={() => { this.setState({ tipsVisible: false }); }}
        />
        {this.state.postAdded &&
          <View style={{ padding: 5, backgroundColor: 'green', width: "100%", marginBottom: 10, borderRadius: 10 }}>
            <Text style={{ color: 'white' }}>Príspevok úspešne pridaný</Text>
          </View>
        }
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Vytvoriť nový príspevok</Text>


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
          value={this.state.showingText}
          autoFocus={true}
          multiline={true}
          returnKeyType='default'
          style={{ height: 100, backgroundColor: '#fff', borderRadius: 10, textAlignVertical: "top", elevation: 3, padding: 5 }}
          onChangeText={text => this.changeText(text)}
          placeholder={'Type something...'}
        />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => this.openImagePicker()} style={{ borderRadius: 10, backgroundColor: '#A41034', width: 100, height: 50, marginTop: 10, justifyContent: 'center', alignItems: 'center', elevation: 5 }}>
            <Icon name="image" color={'#fff'} size={20} />
            <Text style={{ color: '#fff', fontSize: 12 }}>Pridať obrázky</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {this.state.photos.length > 0 &&
              this.state.photos.map((photo) => {
                return (
                  <Image
                    source={{ uri: photo }}
                    style={{ width: 50, height: 50, marginRight: 10 }}
                    width={50}
                    height={50}
                  />
                )
              })
            }
          </View>
        </ScrollView>


        <Text style={{ color: 'gray', fontSize: 10, marginBottom: 15, marginTop: 10 }}>Please make sure that your post don't violate our terms of use</Text>
        <Button title={"Share"} color={"#A41034"} onPress={this.publishPost} disabled={this.state.isDisabled}></Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tipsBox: {
    width: "100%",
    height: 135,
    backgroundColor: "#f9f9f9",
    elevation: 2,
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


export default AddPost
