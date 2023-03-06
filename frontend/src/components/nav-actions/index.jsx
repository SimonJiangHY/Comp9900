import React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import LoginState from '../login-state';

// inline style
const RightContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 1px;
  width: 1000px;
  vertical-align: middle;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const { Search } = Input;

export default function NavActions () {
  const onSearch = (value) => {
    console.log(value);
    if (value !== null) {
      location.href = '/RecipeList/' + value;
    } else {
      location.href = '/RecipeList';
    }
  }

  return (
    <RightContainer>
      <Search placeholder="What would you like to cook" style={{ width: 450 }} onSearch={onSearch} enterButton />
      <span style = {{ marginLeft: '50px' }}>
        <LoginState/>
      </span>
    </RightContainer>
  )
}
