import * as React from "react";
import axios from 'axios'
import IconButton from "@mui/material/IconButton"
import LoadingButton from '@mui/lab/LoadingButton'
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SaveIcon from '@mui/icons-material/Save';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl';
import { useReactMediaRecorder } from "react-media-recorder"

const speakers = [
  'Dex',
  'Eva',
  'Scarlett',
  'Zeus'
]

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="">
        metavoice.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme({
  palette:{
    mode: 'dark'
  }
});

interface Result {
  speaker: string
  url: string,
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function Welcome() {

  const {
    error,
    startRecording, 
    pauseRecording,
    stopRecording, 
    clearBlobUrl,
    mediaBlobUrl,
  } = useReactMediaRecorder({
      video: false,
      audio: true,
      blobPropertyBag: {
        type: "audio/wav"
      }
  })

  const [isRecording, setIsRecording] = React.useState(false)
  const [minute, setMinute] = React.useState('00')
  const [second, setSecond] = React.useState('00')
  const [counter, setCounter] = React.useState(0)
  const [converting, setConverting] = React.useState(false)
  const [convertedVoice, setConvertedVoice] = React.useState<Result[]>([])
  const [speaker, setSpeaker] = React.useState<string[]>([]);


  React.useEffect(() => {
    
    let intervalId: any

    if (isRecording) {
      intervalId = setInterval(() => {
        const secondCounter = counter % 60
        const minuteCounter = Math.floor(counter / 60) % 60
        const computedSecond: string = ('0' + String(secondCounter)).slice(-2)
        const computedMinute: string = ('0' + String(minuteCounter)).slice(-2)
        setSecond(computedSecond)
        setMinute(computedMinute)
        setCounter((counter) => counter + 1)
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [isRecording, counter])

  React.useEffect(() => {
    if(error) setIsRecording(false)
  }, [error])

  const handleRecordingButton = () => {
    if(!isRecording){
      clearBlobUrl()
      setCounter(0)
      startRecording()
    } else {
      pauseRecording()
      stopRecording()
    }
    setIsRecording(!isRecording)
  }
  
  const handleConvertButton = async () => {
    setConverting(true)
    let audioBlob: any
    if(mediaBlobUrl) audioBlob= await fetch(mediaBlobUrl).then(r => r.blob())
    const audiofile: File = new File([audioBlob], "audiofile.webm", { type: "audio/webm" })
    const formData: FormData = new FormData();
    formData.append("file", audiofile);
    formData.append("speaker", JSON.stringify(speaker))
    axios.post(
      'https://small-shadow-digit.glitch.me/convertVoice',
      formData
    ).then((res: any) => {setConvertedVoice(res.data); setConverting(false)})
  }

  const handleMultipleSelect = (event: SelectChangeEvent<typeof speaker>) => {
    const {
      target: { value },
    } = event;
    setSpeaker(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm" >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            sx={{
              height: 120,
              width: 120,
              border: 2
            }}
            color="primary"
            aria-label="record"
            size="large"
            onClick={handleRecordingButton}
          >
            {isRecording ? <MicOffIcon fontSize="inherit" /> : <MicIcon fontSize="inherit" />}
          </IconButton>
          <Typography component="h1" variant="h4" mt={1}>
            {`${minute} : ${second}`}
          </Typography>
          
          { !error ? 
            mediaBlobUrl && ( <audio src={mediaBlobUrl} controls loop />) : 
            (<Typography component="h1" variant="h6" mt={1}>
              {error}
            </Typography>)
          }
            <Typography mt={1} textAlign='center'>
              Convert Mode
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-helper-label">Convert Mode</InputLabel>
              <Select
                sx={{
                  m: 1,
                  width:300
                }}
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={speaker}
                onChange={handleMultipleSelect}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              ><section></section>
                {speakers.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LoadingButton
              // fullWidth
              sx={{
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: 5,
                mt: 3,
                mb: 2,
                p: 1,
                width: 200
              }}
              disabled={!mediaBlobUrl || !speaker.length}
              loading={converting}
              // loadingPosition="start"
              // startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleConvertButton}
            >
              Convert
            </LoadingButton>
            {convertedVoice.length && 
              convertedVoice.map((item: Result) => 
                <Box
                  component="form"
                  display='flex'
                  flexDirection='column'
                  justifyContent='center'
                  alignItems='center'
                  noValidate
                  sx={{ mt: 3 }}
                  key={item.url}
                >
                  <Typography component="h1" variant="h6" mt={1}>
                    {`Mode - ${item.speaker}`}
                  </Typography>
                  <audio src={item.url} controls loop />
                </Box>
              )
            }
            <Grid container justifyContent="center">
              <Grid item>
                <Link href="#" variant="body2">
                  Sign-in for more voices, file uploads & longer clip lengths
                </Link>
              </Grid>
            </Grid>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
