import * as React from 'react'
import { Button } from '@mui/material'
import { SPFI } from '@pnp/sp'
import { Contains } from './helperFunctions'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IDevInfoButon {
  sp: SPFI
  devListById?: number[]
  devListByEmail?: string[]
  onClick?: () => any
}

const DevInfoButon: React.FC<IDevInfoButon> = ({sp, devListById = [], devListByEmail = [], onClick = () => {return}}) => {
  const [show, setShow] = React.useState<boolean>(false)

  React.useEffect(() => {
    sp.web.currentUser().then((user) => {
      if (Contains(devListById, user.Id)) {
        setShow(true)
        return
      }
      if (Contains(devListByEmail, user.Email)) {
        setShow(true)
        return
      }
      if (Contains(devListByEmail, user.LoginName.split('|').pop())) {
        setShow(true)
        return
      }
      if (Contains(devListByEmail, user.UserPrincipalName)) {
        setShow(true)
        return
      }
    }).catch((err) => {
      console.error(err)
    })
  }, [sp])

  try {
    return (
      <>
        {
          show &&
          <Button variant='outlined' size='small' color='info' onClick={onClick}>Info</Button>
        }
      </>
    )
  }
  catch (error) {
    console.error(error)
    return (<></>)
  }
};

export default DevInfoButon;
