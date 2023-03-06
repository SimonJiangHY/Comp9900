import { React, useState } from 'react'
import { HeartTwoTone, MessageOutlined, StarTwoTone, StarOutlined } from '@ant-design/icons';

export default function FavoritesButton () {
  const isFavorites = true
  const favoritesInstructions = (isFavorites === false ? 'c' : 'Cancel Favorites')
  const [favorites, cancle] = useState(favoritesInstructions)
  const clickFavorites = () => {
    cancle(favorites === 'Favorites' ? 'Cancel Favorites' : 'Favorites');
  }
  const favoritesReturn = (favorites === 'Favorites' ? 'no' : 'yes')
  if (favoritesReturn === 'yes') {
    return (
      <div>
        <StarTwoTone onClick = {clickFavorites}></StarTwoTone>
      </div>
    )
  } else {
    return (
      <div>
        <StarTwoTone onClick = {clickFavorites} twoToneColor="yellow"></StarTwoTone>
      </div>
    )
  }
}
