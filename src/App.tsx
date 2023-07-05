import {useState} from 'react';
import './App.css';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container,
    CssBaseline, List, ListItem, TextField,
    Typography
} from "@mui/material";
import {PackageURL} from "packageurl-js"
import Stack from "@mui/material/Stack/Stack";

function DecodePackageURLCard() {
    const [urlToDecode, setUrlToDecode] = useState<string>("")

    let decodedPurl: PackageURL | undefined = undefined;
    let decodedUrlError = false;

    if (urlToDecode.length > 0) {
        try {
            decodedPurl = PackageURL.fromString(urlToDecode);
        } catch (error) {
            decodedUrlError = true
        }
    }

    return <Card sx={{marginBottom: 4}}>
        <CardHeader
            title="Decode Package URL"
            subheader="Decompose a Package URL into its components"
            sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText
            }}
            subheaderTypographyProps={{
                color: (theme) => theme.palette.primary.contrastText
            }}
        />
        <CardContent>
            <TextField
                variant="filled"
                label="Package URL, e.g. pkg:npm/lodash@4.17.21"
                fullWidth
                onChange={(event) => setUrlToDecode(event.target.value)}
                value={urlToDecode}
                error={decodedUrlError}
                helperText={decodedUrlError ? "Invalid Package URL" : ""}
            />
            {decodedPurl !== undefined &&
                <Stack>
                    <Box>
                        <Typography sx={{
                            fontWeight: 'bold',
                            display: 'inline'
                        }}>Type: </Typography>
                        {decodedPurl.type}
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 'bold',
                            display: 'inline'
                        }}>Namespace: </Typography>
                        {decodedPurl.namespace}
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 'bold',
                            display: 'inline'
                        }}>Name: </Typography>
                        {decodedPurl.name}
                    </Box>
                    {decodedPurl.version &&
                        <Box>
                            <Typography sx={{
                                fontWeight: 'bold',
                                display: 'inline'
                            }}>Version: </Typography>
                            {decodedPurl.version}
                        </Box>}
                    {decodedPurl.subpath &&
                        <Box>
                            <Typography sx={{
                                fontWeight: 'bold',
                                display: 'inline'
                            }}>Subpath: </Typography>
                            {decodedPurl.subpath}
                        </Box>}
                    {decodedPurl?.qualifiers && <Box>
                        <Typography sx={{fontWeight: 'bold'}}>Qualifiers:</Typography>
                        <List>
                            {Object.keys(decodedPurl.qualifiers).map(key =>
                                <ListItem>
                                    {key}: {decodedPurl?.qualifiers && decodedPurl.qualifiers[key]}
                                </ListItem>)}
                        </List>
                    </Box>}
                </Stack>}
        </CardContent>
    </Card>
}

function App() {
    return (
        <>
            <CssBaseline/>
            <Container disableGutters maxWidth="lg" component="main" sx={{pt: 8, pb: 6}}>
                <DecodePackageURLCard/>
            </Container>
        </>
    );
}

export default App;
