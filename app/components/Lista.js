import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

export default function Lista({items}) {
  return (
    <List sx={{ width: '100%', maxWidth: 360 }}>
      {items.map((item,index)=>(
        <ListItem key={item.id} sx={{bgcolor:"#1e1e1e", marginBottom:"1em",borderRadius:"12px"}}>
          <ListItemAvatar>
            <Avatar sx={{bgcolor:"#18ba17"}}>
              {index+1}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={item.name} secondary={item.artists.map(artist => artist.name).join(', ')} />
        </ListItem>
      ))}
    </List>
  );
}