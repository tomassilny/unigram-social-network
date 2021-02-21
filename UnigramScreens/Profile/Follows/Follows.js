import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import PropTypes from 'prop-types';
import Follow from './Follow';

class Follows extends React.Component {
    state = {
        users: null,
    }

    constructor(props) {
        super(props);
    }

    handleCloseModal(){
        this.props.handleCloseModal();
    }

    componentDidMount(){
        this.setState({ users: this.props.users })
    }

    render() {
        return (
            <View>
                <View>
                    {this.props.users != null ?
                        <View>
                            {this.props.users.length <= 0 &&
                                <Text style={{ alignSelf: 'center', marginTop: 40, color: 'grey' }}>No followers yet</Text>
                            }
                            <FlatList
                                data={this.props.users}
                                keyExtractor={(item, index) => {
                                    return item.user_id;
                                }}
                                renderItem={({ item }) =>
                                    <Follow
                                        handleCloseModal={this.handleCloseModal.bind(this)}
                                        key={item.user_id}
                                        user={item}
                                    />
                                }
                            />
                        </View>
                        :
                        <View>
                            <ActivityIndicator size="large" color="#A41034" style={{ marginTop: 15 }} />
                        </View>
                    }
                </View>
            </View >
        )
    }
}

Follows.propTypes = {
    users: PropTypes.any.isRequired
};

export default Follows