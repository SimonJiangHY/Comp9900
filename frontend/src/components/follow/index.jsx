import { React, useEffect, useState, useMemo } from 'react';
import { Avatar, List, message } from 'antd';
import useUser from '../../hooks/useUser';
import { getToken } from '../../utils';

export default function Follow () {
  const { getId } = useUser();
  const id = getId();
  const [followList, setfollow] = useState([])
  // interaction
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/follow/' + id + '/following' + '?page=' + 1 + '&pagesize=' + 50
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.follow) {
            if (data.message.follow.includes('you have not followed anyone yet')) {
              message.error('no data');
              setfollow([])
            }
          // console.log('recipes list', recipesList);
          }
        } else {
          setfollow(data.follows);
          console.log('you follower list', data.follows)
        }
      });
  }, [])
  const FollowListdata = useMemo(() => {
    return followList.map(x => ({
      ...x,
      id: x.user_id,
      name: x.user_name,
      avatar: 'http://127.0.0.1:5000/' + x.photo,
      description: x.email,
      url: '../OtherPersonalInfor/' + x.user_id
    }));
  }, [followList]);
  console.log('list', FollowListdata);

  return (
    <List
        header={<div style = {{ fontsize: '80px' }}>Following</div>}
        itemLayout="horizontal"
        dataSource={FollowListdata}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 8,
          style: { textAlign: 'center' },
        }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar size = {50} src={item.avatar} />}
              title={<a href={item.url}>{item.name}</a>}
              description={item.description}
            />
          </List.Item>
        )}
      />
  )
}
