import React, {useState} from 'react';
import './App.css';
import {
    Box, Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    CssBaseline, IconButton, List, ListItem, ListItemText, TextField,
    Typography
} from "@mui/material";
import {PackageURL} from "packageurl-js"
import Stack from "@mui/material/Stack/Stack";
import DeleteIcon from '@mui/icons-material/Delete';

const NuGetRegex = new RegExp("https://www\\.nuget\\.org/packages/(?<name>[^/]+)((/(?<version>[^/]+))?|\\/)$")
const PyPiRegex = new RegExp("https://pypi\\.org/project/(?<name>[^/]+)((/(?<version>(?!#history)[^/]+))?|\\/)$")

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
            } catch (error) {
            }
        }

        let nuGetMatch = NuGetRegex.exec(registryURL)
        if (nuGetMatch?.groups) {
            try {
                purl = new PackageURL("nuget", undefined, nuGetMatch.groups["name"], nuGetMatch.groups["version"], undefined, undefined)
            } catch (error) {
            }
        }

        let pypiMatch = PyPiRegex.exec(registryURL)
        if (pypiMatch?.groups) {
            try {
                purl = new PackageURL("pypi", undefined, pypiMatch.groups["name"], pypiMatch.groups["version"], undefined, undefined)
            } catch (error) {
            }
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

function GenerateManuallyCard() {
    interface QualifierAddFormProps {
        onAddQualifier: (key: string, value: string) => void
    }

    function QualifierAddForm({onAddQualifier}: QualifierAddFormProps) {
        const [qualifierAddFormKey, setQualifierAddFormKey] = useState("")
        const [qualifierAddFormValue, setQualifierAddFormValue] = useState("")
        const [formErrorTexts, setFormErrorTexts] = useState<{key: undefined | string, value: undefined | string}>({
            key: undefined,
            value: undefined
        })

        let handleAddButtonClick = function() {
            if (qualifierAddFormKey && qualifierAddFormValue) {
                onAddQualifier(qualifierAddFormKey, qualifierAddFormValue)
                setQualifierAddFormKey("")
                setQualifierAddFormValue("")
                setFormErrorTexts({key: undefined, value: undefined})
            } else {
                setFormErrorTexts({
                    key: qualifierAddFormKey ? undefined : "A key is required.",
                    value: qualifierAddFormValue ? undefined : "A value is required"
                })
            }
        }

        return <Stack direction={"row"}>
            <TextField variant="filled"
                       label="Qualifier Key"
                       value={qualifierAddFormKey}
                       onChange={(event) => setQualifierAddFormKey(event.target.value)}
                       error={!!formErrorTexts["key"]}
                       helperText={formErrorTexts["key"]}
            />
            <TextField variant="filled"
                       label="Qualifier Value"
                       value={qualifierAddFormValue}
                       onChange={(event) => setQualifierAddFormValue(event.target.value)}
                       error={!!formErrorTexts["value"]}
                       helperText={formErrorTexts["value"]}
            />
            <Button variant={"contained"} onClick={handleAddButtonClick}>Add</Button>
        </Stack>
    }

    const [type, setType] = useState("")
    const [namespace, setNamespace] = useState("")
    const [name, setName] = useState("")
    const [version, setVersion] = useState("")
    const [subpath, setSubpath] = useState("")
    const [qualifiers, setQualifiers] = useState<{[key: string]: string}>({})

    let purl: PackageURL | undefined = undefined;
    if (type && name) {
        purl = new PackageURL(
            type,
            namespace ? namespace : undefined,
            name,
            version? version : undefined,
            Object.keys(qualifiers).length? qualifiers : undefined,
            subpath? subpath : undefined)
    }

    let typeOrNameMissing = (type && !name) || (name && !type)

    let onAddQualifier = function(key: string, value: string) {
        setQualifiers({
            ...qualifiers,
            [key]: value
        })
    }

    let onDeleteQualifier = function(key: string) {
        const {[key]: _, ...rest} = qualifiers // Remove qualifier with key 'key'
        setQualifiers(rest)
    }

    return <Card sx={{marginBottom: 4}}>
        <CardHeader
            title="Create Package URL from Components"
            sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText
            }}
        />
        <CardContent>
            <TextField variant="filled"
                       label="Type"
                       value={type}
                       onChange={(event) => setType(event.target.value)}
            />
            <TextField variant="filled"
                       label="Namespace"
                       value={namespace}
                       onChange={(event) => setNamespace(event.target.value)}
            />
            <TextField variant="filled"
                       label="Name"
                       value={name}
                       onChange={(event) => setName(event.target.value)}
            />
            <TextField variant="filled"
                       label="Version"
                       value={version}
                       onChange={(event) => setVersion(event.target.value)}
            />
            <TextField variant="filled"
                       label="Subpath"
                       value={subpath}
                       onChange={(event) => setSubpath(event.target.value)}
            />
            <br />

            <Typography sx={{
                fontWeight: 'bold',
                display: 'inline'
            }}>Qualifiers:</Typography>
            <Stack sx={{ marginLeft: 3}}>
                <QualifierAddForm onAddQualifier={onAddQualifier}/>

                <List>
                    {Object.keys(qualifiers).map(key =>
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={(_) => onDeleteQualifier(key)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText>{key}: {qualifiers[key]}</ListItemText>
                    </ListItem>)}
                </List>
            </Stack>

            {typeOrNameMissing && <React.Fragment>
                <Typography sx={{
                    fontWeight: 'bold',
                    display: 'inline'
                }}>Type and Name components are required.</Typography>
            </React.Fragment>}

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
                <GenerateManuallyCard />
                <DecodePackageURLCard/>
            </Container>
        </>
    );
}

export default App;
