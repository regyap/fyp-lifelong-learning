
import * as React from 'react';
import Box from '@mui/material/Box';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import "./textboxeditprofile.css";

function TextBoxEditProfile() {
    const [name, setName] = React.useState("");
    const handleChange = (event) => {

        setName(event.target.value)
    }


    return (
        <>
            <div className="field" />
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1 },
                }}
                noValidate
                autoComplete="off"

            >

                <FormControl variant="standard">
                    <InputLabel htmlFor="component-helper" style={{ zIndex: "1" }} >Name</InputLabel>

                    <Input
                        id="component-helper"
                        value={name}
                        aria-describedby="component-helper-text"
                        onChange={handleChange}
                        className="inputbox"
                        inputProps={{
                            style: { background: "transparent" }
                        }}




                    />

                </FormControl>
                <FormControl>
                    <InputLabel
                        htmlFor="component-outlined"
                    // inputProps={{
                    //     style: { padding: '100px', color: 'white', outline: 'none' },
                    // }}
                    >Name</InputLabel>
                    <OutlinedInput
                        id="component-outlined"
                        value={name}
                        label="Name"
                        onChange={handleChange}
                    // sx={{
                    //     style: { background: 'transparent', border: '1px solid white', height: '20px' },
                    // }}
                    />
                </FormControl>



            </Box >
        </>
    )

}

export default TextBoxEditProfile