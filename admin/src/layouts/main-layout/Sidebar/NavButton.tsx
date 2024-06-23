import { ReactElement, useState } from 'react';
import {
  Collapse,
  LinkTypeMap,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';
import { NavItem } from 'data/nav-items';

interface NavItemProps {
  navItem: NavItem;
  Link: OverridableComponent<LinkTypeMap>;
}

const NavButton = ({ navItem, Link }: NavItemProps): ReactElement => {
  const { pathname } = useLocation();
  const [checked, setChecked] = useState(false);
  const [nestedChecked, setNestedChecked] = useState<boolean[]>([]);

  const handleNestedChecked = (index: any, value: boolean) => {
    const updatedBooleanArray = [...nestedChecked];
    updatedBooleanArray[index] = value;
    setNestedChecked(updatedBooleanArray);
  };

  return (
    <ListItem
      sx={{
        my: 1.25,
        borderRadius: 2,
        backgroundColor: pathname === navItem.path ? 'primary.main' : '',
        color: pathname === navItem.path ? 'common.white' : 'text.secondary',
        '&:hover': {
          backgroundColor: pathname === navItem.path ? 'primary.main' : 'action.focus',
          opacity: 1.5,
        },
      }}
    >
      {navItem.collapsible ? (
        <>
          <ListItemButton LinkComponent={Link} onClick={() => setChecked(!checked)}>
            <ListItemIcon>
              <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
            </ListItemIcon>
            <ListItemText>{navItem.title}</ListItemText>
            <ListItemIcon>
              {navItem.collapsible &&
                (checked ? (
                  <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                ) : (
                  <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                ))}
            </ListItemIcon>
          </ListItemButton>
          <Collapse in={checked}>
            <List>
              {navItem.sublist?.map((subListItem: any, idx: number) => (
                <ListItem
                  key={idx}
                  sx={{
                    backgroundColor: pathname === navItem.path ? 'primary.main' : '',
                    color: pathname === navItem.path ? 'common.white' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: pathname === navItem.path ? 'primary.main' : 'action.focus',
                      opacity: 1.5,
                    },
                  }}
                >
                  {subListItem.collapsible ? (
                    <>
                      <ListItemButton
                        LinkComponent={Link}
                        onClick={() => {
                          handleNestedChecked(idx, !nestedChecked[idx]);
                        }}
                      >
                        <ListItemText sx={{ ml: 3.5 }}>{subListItem.title}</ListItemText>
                        <ListItemIcon>
                          {subListItem.collapsible &&
                            (nestedChecked[idx] ? (
                              <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                            ) : (
                              <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                            ))}
                        </ListItemIcon>
                      </ListItemButton>
                      <Collapse in={nestedChecked[idx]}>
                        <List>
                          {subListItem?.sublist?.map(
                            (nestedSubListItem: any, nestedIdx: number) => (
                              <ListItem key={nestedIdx}>
                                <ListItemButton
                                  LinkComponent={Link}
                                  href={
                                    navItem.path !== '/'
                                      ? navItem.path +
                                        '/' +
                                        subListItem.path +
                                        '/' +
                                        nestedSubListItem.path
                                      : nestedSubListItem.path
                                  }
                                >
                                  <ListItemText sx={{ ml: 5 }}>
                                    {nestedSubListItem.title}
                                  </ListItemText>
                                </ListItemButton>
                              </ListItem>
                            ),
                          )}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    <ListItemButton
                      LinkComponent={Link}
                      href={navItem.path + '/' + subListItem.path}
                    >
                      <ListItemText sx={{ ml: 3 }}>{subListItem.title}</ListItemText>
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </>
      ) : (
        <ListItemButton
          LinkComponent={Link}
          href={navItem.path}
          sx={{ opacity: navItem.active ? 1 : 0.6 }}
        >
          <ListItemIcon>
            <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
          </ListItemIcon>
          <ListItemText>{navItem.title}</ListItemText>
        </ListItemButton>
      )
      }
    </ListItem>
  );
};

export default NavButton;
