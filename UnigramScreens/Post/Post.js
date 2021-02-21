import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper'
import AsyncStorage from '@react-native-community/async-storage'
import Modal from 'react-native-modal';
import Comments from './Comments/Comments';
import Reactions from './Reactions/Reactions';
import ActionSheet from 'react-native-actionsheet'
import RNRestart from 'react-native-restart';
import { Actions } from 'react-native-router-flux';
import CameraRoll from "@react-native-community/cameraroll";
import RNFetchBlob from "rn-fetch-blob";
import Share from './Share';

class Post extends React.Component {
  state = {
    medias: null,
    published: '',
    userID: null,
    reaction: null,
    commentsVisible: false,
    reactionsVisible: false,
    imagesModalVisible: false,
    reactionsCount: 0,
    commentsCount: 0,
    likesPercents: 0, lovePercents: 0, hahaPercents: 0, firePercents: 0,
    reactionsShow: 'all',
    reactions: null,
    likes: 0, love: 0, haha: 0, fire: 0,
    deleted: false,
    actualImageURL: null
  }

  constructor(props) {
    super(props);
    this.state.medias = props.medias.split(";");
  }

  goToProfile = () => {
    Actions.profile({ userID: this.props.author_id });
  }

  setReactionFromDB() {
    // Get if user already react on this post
    fetch('https://wawier.com/unigram/posts/getreaction.php?user_id=' + this.state.userID + "&post_id=" + this.props.postID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          reaction: responseJson.reaction,
        }));

      })
      .catch((error) => {
        console.error(error);
      });
  }

  async getActualUserID() {
    try {
      const id = await AsyncStorage.getItem("@id");
      if (id !== null) {
        this.setState({ userID: id })
        this.setReactionFromDB();
      }
    } catch (e) {
    }
  }

  getReactionsAndCommentsCount() {
    fetch('https://wawier.com/unigram/posts/count.php?post_id=' + this.props.postID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          reactionsCount: responseJson.count_reactions,
          commentsCount: responseJson.count_comments,
          likesPercents: responseJson.likes_percent,
          lovePercents: responseJson.love_percent,
          hahaPercents: responseJson.haha_percent,
          firePercents: responseJson.fire_percent,
          likes: responseJson.likes_count,
          love: responseJson.love_count,
          haha: responseJson.haha_count,
          fire: responseJson.fire_count
        }));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentDidMount() {
    this.getActualUserID();
    this.getReactionsAndCommentsCount();
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  };

  // Close modal from other components
  handleCloseModal() {
    this.setState({ reactionsVisible: false, commentsVisible: false })
  }

  pushedReaction(reaction) {
    fetch('https://wawier.com/unigram/posts/react.php?user_id=' + this.state.userID + "&post_id=" + this.props.postID + "&reaction=" + reaction, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(() => ({
          reaction: reaction,
        }));
        this.setReactionFromDB();
        this.getReactionsAndCommentsCount();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  loadReactions() {
    // Get comments for this post from db
    fetch('https://wawier.com/unigram/posts/getreactions.php?post_id=' + this.props.postID + "&reaction=" + this.state.reactionsShow, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          reactions: responseJson,
        }
        );
      })

      .catch((error) => {
        console.error(error);
      });
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
        Alert.alert("Image successfully downloaded", "Image successfully downloaded and saved to gallery")
      });
    } else {
      CameraRoll.saveToCameraRoll(uri);
    }
  }


  deletePost() {
    // Get comments for this post from db
    fetch('https://wawier.com/unigram/posts/delete.php?post_id=' + this.props.postID, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        Alert.alert("Info", "Príspevok úspešne vymazaný");
        RNRestart.Restart();
      })

      .catch((error) => {
        console.error(error);
      });
  }

  setReactionsToShow(reaction) {
    this.setState({ reactionsShow: reaction }, () => this.loadReactions());
  }

  render() {
    if (this.props.author_id == this.state.userID) {
      var optionArray = [
        'Delete',
        'Report',
        'Cancel',
      ];
    } else {
      var optionArray = [
        'Report',
        'Cancel',
      ];
    }

    return (
      <View style={styles.card}>

        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={optionArray}
          cancelButtonIndex={optionArray.length - 1}
          destructiveButtonIndex={optionArray.length - 1}
          onPress={index => {
            if (index == 0) {
              if (this.props.author_id == this.state.userID) {
                this.deletePost();
              } else {
                alert("Nahlasit");
              }
            }
          }}
        />

        <Modal style={{ justifyContent: "center" }}
          isVisible={this.state.reactionsVisible}
          onSwipeComplete={() => this.setState({ reactionsVisible: false })}
          onModalShow={() => { this.loadReactions() }}
          swipeDirection="down"
          animationIn="slideInUp"
        >

          <View style={{ width: "100%", height: "90%", backgroundColor: "#fff", borderRadius: 15, elevation: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { this.setReactionsToShow('all') }} style={{ alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, marginLeft: 15, backgroundColor: this.state.reactionsShow == 'all' ? '#f1f1f1' : '#fff' }}>
                  <Text style={{ fontWeight: 'bold' }}>Všetky</Text>
                  <Text>{this.state.reactionsCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.setReactionsToShow('like') }} style={{ alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, backgroundColor: this.state.reactionsShow == 'like' ? '#f1f1f1' : '#fff' }}>
                  <Icon name="thumbs-up" color={'#A41034'} size={18} />
                  <Text>{this.state.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setReactionsToShow('love')} style={{ alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, backgroundColor: this.state.reactionsShow == 'love' ? '#f1f1f1' : '#fff' }}>
                  <Icon name="heart" color={'red'} size={18} />
                  <Text>{this.state.love}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setReactionsToShow('haha')} style={{ alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, backgroundColor: this.state.reactionsShow == 'haha' ? '#f1f1f1' : '#fff' }}>
                  <Image source={require('./../../images/laugh.png')} width={18} height={18} style={{ width: 18, height: 18 }} />
                  <Text>{this.state.haha}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setReactionsToShow('fire')} style={{ alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, backgroundColor: this.state.reactionsShow == 'fire' ? '#f1f1f1' : '#fff' }}>
                  <Image source={require('./../../images/fire.png')} width={18} height={18} style={{ width: 18, height: 18 }} />
                  <Text>{this.state.fire}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ margin: 15 }}>
                <Icon name='angle-down' size={24} style={{ alignSelf: 'flex-end' }} color={'grey'} onPress={() => { this.setState({ reactionsVisible: false }) }}></Icon>
              </TouchableOpacity>
            </View>
            <View style={{ width: '100%', height: 2, backgroundColor: '#eee' }}></View>

            {this.state.reactionsVisible && this.state.reactions != null ?
              <Reactions
                userID={this.state.userID}
                postID={this.props.postID}
                reactions={this.state.reactions}
                handleCloseModal={this.handleCloseModal.bind(this)}
              />
              :
              <View>
                <ActivityIndicator size="small" color="#A41034" style={{ marginTop: 15 }} />
              </View>
            }
          </View>
        </Modal>

        <Modal style={{ justifyContent: "center" }}
          isVisible={this.state.commentsVisible}
          onSwipeComplete={() => this.setState({ commentsVisible: false })}
          swipeDirection="down"
          animationIn="slideInUp"
        >

          <View style={{ width: "100%", height: "90%", backgroundColor: "#fff", borderRadius: 15, elevation: 5 }}>
            <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, alignSelf: 'flex-start' }}>Komentáre ({this.state.commentsCount})</Text>
              <TouchableOpacity>
                <Icon name='angle-down' size={24} style={{ alignSelf: 'flex-end' }} color={'grey'} onPress={() => { this.setState({ commentsVisible: false }) }}></Icon>
              </TouchableOpacity>
            </View>
            <View style={{ width: '100%', height: 2, backgroundColor: '#eee' }}></View>

            {this.state.commentsVisible ?
              <Comments
                userID={this.state.userID}
                postID={this.props.postID}
                handleCloseModal={this.handleCloseModal.bind(this)}
              />
              :
              <View>
                <ActivityIndicator size="small" color="#A41034" style={{ marginTop: 15 }} />
              </View>
            }
          </View>
        </Modal>

        {this.props.medias != '' &&

          <Modal style={{ justifyContent: "center" }}
            isVisible={this.state.imagesModalVisible}
            onSwipeComplete={() => this.setState({ imagesModalVisible: false })}
            swipeDirection="down"
            animationIn="slideInUp"
          >

            <View style={{ width: "100%", height: "95%", borderRadius: 15 }}>
              <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
              </View>

              {this.props.medias != '' &&
                <Swiper style={styles.wrapperModal} showsButtons={false} height={500} loop={false} activeDotColor={'#A41034'}>
                  {this.state.medias.map((photo) => {
                    return (
                      <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <TouchableOpacity>
                            <Icon name='angle-down' size={35} style={{ alignSelf: 'flex-end' }} color={'white'} onPress={() => { this.setState({ imagesModalVisible: false }) }}></Icon>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 12 }} onPress={() => this.downloadImage('https://wawier.com/unigram/posts/images/' + photo)}>
                            <Icon name='download' size={20} color={'white'}></Icon>
                          </TouchableOpacity>
                        </View>
                        <Image source={{ uri: 'https://wawier.com/unigram/posts/images/' + photo }} style={{ width: "100%", height: 600, maxHeight: 600, marginTop: 10 }} key={photo}></Image>
                      </View>
                    )
                  })}
                </Swiper>

              }
            </View>
          </Modal >
        }

        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={this.goToProfile}>
            <View style={styles.cardHeaderLeft}>
              {this.props.profile_picture == null ?
                <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={30} height={30} />
                :
                <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + this.props.profile_picture }} width={30} height={30} />
              }
              <Text style={styles.cardAuthorTxt}>{this.props.fullname}{"\n"}<Text style={styles.date}>{this.props.published}</Text></Text>
            </View>
          </TouchableOpacity>
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity onPress={this.showActionSheet}
            >
              <Icon name="ellipsis-v" style={styles.moreButton} color={'#ddd'} size={25} />
            </TouchableOpacity>
          </View>
        </View>
        {
          this.props.statusText != '' &&
          <Text style={styles.statusText}>{this.props.statusText}</Text>
        }

        {
          this.props.medias != '' &&

          <Swiper style={styles.wrapper} showsButtons={false} height={300} loop={false} activeDotColor={'#A41034'}>
            {this.state.medias.map((photo) => {
              return (
                <TouchableOpacity onPress={() => this.setState({ imagesModalVisible: true })} >
                  <Image source={{ uri: 'https://wawier.com/unigram/posts/images/' + photo }} style={{ width: "100%", height: 300, maxHeight: 300, marginTop: 10 }} key={photo}></Image>
                </TouchableOpacity>
              )
            })}
          </Swiper>
        }

        <View style={{ marginTop: 10, flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { this.setState({ reactionsVisible: true }) }}>
            <Text style={{ color: 'grey' }}>{this.state.reactionsCount} reactions</Text>
          </TouchableOpacity>
          <Text style={{ color: 'grey' }}> • </Text>
          <TouchableOpacity onPress={() => { this.setState({ commentsVisible: true }) }}>
            <Text style={{ color: 'grey' }}>{this.state.commentsCount} comments</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 5, flex: 1, backgroundColor: '#f1f1f1' }}>
          <View style={{ flex: this.state.likesPercents, backgroundColor: '#A41034', height: 5 }} />
          <View style={{ flex: this.state.lovePercents, backgroundColor: 'red', height: 5 }} />
          <View style={{ flex: this.state.hahaPercents, backgroundColor: '#ffd93b', height: 5 }} />
          <View style={{ flex: this.state.firePercents, backgroundColor: 'orange', height: 5 }} />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => this.pushedReaction('like')}>
            {this.state.reaction == 'like' ?
              <Icon name="thumbs-up" color={'#A41034'} size={25} />
              :
              <Icon name="thumbs-up" color={'#A41034'} size={25} style={{ opacity: 0.3 }} />
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.pushedReaction('love')}>
            {this.state.reaction == 'love' ?
              <Icon name="heart" color={'red'} size={25} style={{ marginLeft: 5 }} />
              :
              <Icon name="heart" color={'red'} size={25} style={{ marginLeft: 5, opacity: 0.3 }} />
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.pushedReaction('haha')}>
            {this.state.reaction == 'haha' ?
              <Image source={require('./../../images/laugh.png')} width={25} height={25} style={{ marginLeft: 5, width: 25, height: 25 }} />
              :
              <Image source={require('./../../images/laugh.png')} width={25} height={25} style={{ marginLeft: 5, width: 25, height: 25, opacity: 0.3 }} />
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.pushedReaction('fire')}>
            {this.state.reaction == 'fire' ?
              <Image source={require('./../../images/fire.png')} width={25} height={25} style={{ marginLeft: 5, width: 25, height: 25 }} />
              :
              <Image source={require('./../../images/fire.png')} width={25} height={25} style={{ marginLeft: 5, width: 25, height: 25, opacity: 0.3 }} />
            }
          </TouchableOpacity>

          <View style={styles.separateLine}></View>
          <TouchableOpacity style={styles.row} onPress={() => { this.setState({ commentsVisible: true }) }}>
            <Icon name="comment" color={'#212121'} size={25} style={{ marginLeft: 15 }} />
            <Text style={styles.commentText}>Comment</Text>
          </TouchableOpacity>
          <View style={styles.separateLine}></View>
          <Share></Share>
        </View>
      </View >
    )
  }
}
Post.propTypes = {
  fullname: PropTypes.string.isRequired, statusText: PropTypes.string.isRequired,
  medias: PropTypes.string, published: PropTypes.string, postID: PropTypes.string.isRequired,
  author_id: PropTypes.string, profile_picture: PropTypes.any
};

export default Post

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: "white",
    padding: 20,
    marginTop: 15,
    width: "100%",
  },
  avatar: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 1,
  },
  cardHeader: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
  },
  cardAuthorTxt: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  date: {
    color: 'grey',
    fontSize: 12,
  },
  moreButton: {
    alignSelf: 'flex-end',
    backgroundColor: "#fff",
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
  },
  bottomLine: {
    width: "100%",
    height: 1.8,
    backgroundColor: "#eee",
    alignSelf: 'center',
    marginTop: 15
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  separateLine: {
    width: 2,
    height: 25,
    backgroundColor: '#eee',
    marginLeft: 15
  },
  commentText: {
    marginLeft: 10,
    color: '#212121',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
  },
  wrapper: {},
  wrapperModal: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  reactionsCountText: {
    color: 'grey', fontSize: 10, alignSelf: 'center', color: '#A41034'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});
