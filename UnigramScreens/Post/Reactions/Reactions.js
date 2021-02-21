import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import PropTypes from 'prop-types';
import Reaction from './Reaction';

class Reactions extends React.Component {
    state = {
        reactions: null,
    }

    constructor(props) {
        super(props);
    }

    handleCloseModal() {
        this.props.handleCloseModal();
    }

    render() {
        return (
            <View>
                <View>
                    {this.props.reactions != null ?
                        <View>
                            {this.props.reactions.length <= 0 &&
                                <Text style={{ alignSelf: 'center', marginTop: 40, color: 'grey' }}>No reactions yet</Text>
                            }
                            <FlatList
                                data={this.props.reactions}
                                keyExtractor={(item, index) => {
                                    return item.user_id;
                                }}
                                renderItem={({ item }) =>
                                    <Reaction
                                        handleCloseModal={this.handleCloseModal.bind(this)}
                                        key={item.user_id}
                                        reaction={item}
                                        postID={this.props.postID}
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
Reactions.propTypes = {
    userID: PropTypes.string.isRequired, postID: PropTypes.string.isRequired,
};

export default Reactions