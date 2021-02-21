import React from 'react';
import { SearchBar } from 'react-native-elements'
import { View, Text, StyleSheet, StatusBar, FlatList, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { TouchableOpacity, TouchableHighlight, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage'
import { Actions } from 'react-native-router-flux';

class Search extends React.Component {
    state = {
        userID: null,
        query: '',
        results: null,
        loading: false
    };

    constructor(props) {
        super(props);
    }

    async getActualUserID() {
        try {
            const id = await AsyncStorage.getItem("@id");
            // if this is profile of logged user (himself)
            this.setState({ userID: id });

        } catch (e) {
        }
    }

    updateSearch = (query) => {
        this.setState({ query }, () => this.search());
    };

    componentDidMount() {
        this.getActualUserID();
    }

    goToProfile(id) {
        Actions.profile({ userID: id });
    }

    search() {
        this.setState({ loading: true });
        fetch('https://wawier.com/unigram/search/search.php?q=' + this.state.query + "&offset=0", {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState(() => ({
                    results: responseJson,
                    loading: false
                }));
                console.log(responseJson);

            })
            .catch((error) => {
                console.error(error);
                this.setState({ loading: false });
            });
    }

    separator() {
        return (
            <View style={{ flex: 1, marginTop: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
                <StatusBar backgroundColor="#A41034" barStyle="light-content" />
                <SearchBar
                    placeholder="Type..."
                    onChangeText={this.updateSearch}
                    value={this.state.query}
                    lightTheme={true}
                    round={true}
                    showCancel={false}
                    autoFocus={true}
                />
                <View style={{ flex: 1 }}>
                    {this.state.results == null || this.state.query == "" ?
                        <Text style={{ color: "grey", alignSelf: "center", width: 300, marginTop: 50, textAlign: "center" }}>
                            <Icon name={"search"} size={50} />{'\n\n'}
                                Start typing text above, you can find people or pages</Text>
                        :
                        <View style={{ flex: 1 }}>
                            {this.state.loading ?
                                <View>
                                    <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                                </View>
                                :
                                <View style={{ flex: 1 }}>
                                    {this.state.results.length == 0 ?
                                        <Text style={{ color: "grey", alignSelf: "center", width: 300, marginTop: 50, textAlign: "center" }}>
                                            <Icon name={"times"} size={50} />{'\n\n'}
                                Žiadny výsledok nebol nájdený. Skúste zadať iný výraz</Text>
                                        :
                                        <FlatList
                                            data={this.state.results}
                                            style={styles.block}
                                            ItemSeparatorComponent={this.separator}
                                            keyExtractor={(item, index) => {
                                                return item.id;
                                            }}
                                            renderItem={({ item }) =>
                                                <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 18 }}>
                                                    <TouchableOpacity onPress={() => this.goToProfile(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {(item.profile_picture == 'null' || item.profile_picture == null) ?
                                                            <Image style={styles.avatar} source={require('./../../images/avatar.png')} width={40} height={40} />
                                                            :
                                                            <Image style={styles.avatar} source={{ uri: "https://wawier.com/unigram/profile/images/" + item.profile_picture }} width={40} height={40} />
                                                        }
                                                        <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{item.name} {item.surname}</Text>
                                                    </TouchableOpacity>
                                                </View>}
                                        />
                                    }
                                </View>
                            }
                        </View>
                    }
                </View>
            </View>
        )
    }
}

export default Search

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
    block: {
        marginTop: 15,
        width: "95%",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "white",
        elevation: 3,
        alignSelf: "center"
    },
    header: {
        fontWeight: "bold",
        fontSize: 20,
        marginBottom: 10
    },
    item: {
        alignItems: "center",
        flexDirection: "row",
        padding: 10,
        borderBottomColor: "#f1f1f1",
        borderBottomWidth: 1
    },
    itemText: {
        marginLeft: 10,
        fontSize: 16
    }
});