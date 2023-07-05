import React, {useState} from 'react';
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

const NuGetRegex = new RegExp("https://www\\.nuget\\.org/packages/(?<name>[^/]+)(/(?<version>[^/]+))?$")

function GenerateFromRegistryURLCard() {
    const [registryURL, setRegistryURL] = useState("")

    let purl: PackageURL | undefined = undefined
    if (registryURL.length > 0) {
        // Parse npmjs.org URL to extract package name and version
        if (registryURL.startsWith("https://www.npmjs.com/package/")) {
            let pathComponents = registryURL
                .replace("https://www.npmjs.com/package/", "")
                .split("/")

            let namespace: string | undefined = undefined;
            let name;
            let version: string | undefined = undefined;

            if (pathComponents.indexOf("v") === pathComponents.length - 2) {
                version = pathComponents.pop()
                pathComponents.pop()
            }

            if (pathComponents.length > 1) {
                namespace = pathComponents[0]
                name = pathComponents[1]
            } else {
                name = pathComponents[0]
            }

            try {
                purl = new PackageURL("npm", namespace, name, version, undefined, undefined)
            } catch (error) {}
        }

        let nuGetMatch = NuGetRegex.exec(registryURL)
        if (nuGetMatch?.groups) {
            try {
                purl = new PackageURL("nuget", undefined, nuGetMatch.groups["name"], nuGetMatch.groups["version"], undefined, undefined)
            } catch (error) {}
        }
    }

    let isError = registryURL.length > 0 && !purl

    return <Card sx={{marginBottom: 4}}>
        <CardHeader
            title="Create Package URL From Package Registry URL"
            subheader="Create a Package URL from a package registry URL (e.g. https://www.npmjs.com/package/lodash/v/4.17.21)"
            sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText
            }}
            subheaderTypographyProps={{
                color: (theme) => theme.palette.primary.contrastText
            }}
        />
        <CardContent>
            <TextField variant="filled"
                       label="Package Registry URL, e.g. https://www.npmjs.com/package/lodash/v/4.17.21"
                       fullWidth
                       error={isError}
                       helperText={isError && "Given URL is either invalid or not supported."}
                       onChange={event => setRegistryURL(event.target.value)}
                       value={registryURL}
            />
            {purl && <React.Fragment>
                <Typography sx={{
                    fontWeight: 'bold',
                    display: 'inline'
                }}>Package URL: </Typography>
                {purl.toString()}
            </React.Fragment>}
        </CardContent>
    </Card>
}

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
                <GenerateFromRegistryURLCard/>
                <DecodePackageURLCard/>
            </Container>
        </>
    );
}

export default App;
