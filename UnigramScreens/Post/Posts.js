import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import Post from './Post';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage'

class Posts extends React.Component {
  state = {
    posts: [],
    refreshing: false,
    offset: 0,
    postsFromUserID: 0
  };

  constructor(props) {
    super(props);
  }

  onRefresh = () => {
    this.setState({ refreshing: true, offset: 0, posts: [] }, () => this.loadPosts());
  }

  async checkLogin() {
    try {
      const id = await AsyncStorage.getItem("@id");
      if (id !== null) {
        this.setState({
          postsFromUserID: id
        });
        this.loadPosts();
      } else {
      }
    } catch (e) {
    }
  }

  loadPosts() {
    fetch('https://wawier.com/unigram/posts/get.php?offset=' + this.state.offset + '&user_id=' + this.state.postsFromUserID + "&dashboard=" + (this.props.dashboard ? "1" : "0"), {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState(() => ({
          posts: this.state.posts.concat(responseJson),
          refreshing: false
        }));
      })
      .catch((error) => {
        console.error(error);
      });
  }


  componentDidMount() {
    this.checkLogin();
  }

  loadMore = () => {
    this.setState({ offset: this.state.offset + 6 }, () => this.loadPosts());
  }

  render() {
    return (
      <SafeAreaView>
        {this.state.posts != null ?
          <View>
            {this.state.posts.length > 0 ?
              <FlatList
                showsVerticalScrollIndicator={false}
                onEndReached={this.loadMore}
                onEndReachedThreshold={1.5}
                style={{ marginBottom: 50 }}
                refreshControl={
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }
                data={this.state.posts}
                keyExtractor={(item, index) => {
                  return item.post_id;
                }}
                renderItem={({ item }) =>
                  <Post
                    fullname={item.firstname + " " + item.surname}
                    statusText={item.text}
                    medias={item.medias}
                    published={item.datetext}
                    postID={item.post_id}
                    author_id={item.author_id}
                    profile_picture={item.profile_picture}
                    key={item.post_id}></Post>
                }
              />
              :
              <View>
                <Text style={{ alignSelf: "center", textAlign: "center", color: "grey" }}>Not yet posts to show</Text>
              </View>
            }
          </View>
          :
          <View>
            <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
          </View>
        }
      </SafeAreaView>

    )
  }
}
Posts.propTypes = {
  postsFromUserID: PropTypes.any.isRequired,
};


export default Posts
