# sharepoint-forms

## Summary

Short summary on functionality and used technologies.

[picture of the solution in action, if possible]

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.16.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Any special pre-requisites?

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| folder name | Author details (name, company, twitter alias with link) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass**
  - **gulp serve**

> Include any additional steps as needed.

- node/npm versions
  - to install new node modules:
    - **npm install -g -node@19**
    - **npm install -g npm@9**
  - to run and deploy:
    - **npm install -g -node@16**
    - **npm install -g npm@6**

- To deploy
  - **gulp clean**
  - **gulp build**
  - **gulp bundle --ship**
  - **gulp package-solution --ship**

- To create app list for the site
  - **Connect-SPOService -Url https://contoso-admin.sharepoint.com**
  - **$site = Get-SPOSite https://contoso.sharepoint.com/sites/commssite**
  - **Add-SPOSiteCollectionAppCatalog -Site $site**

- Tutorial to create new Id for the app
  - **https://www.c-sharpcorner.com/article/deploy-multiple-instance-of-spfx-webpart-in-same-app-catalog/**

- App componentId: 05459ba7-ba24-45da-be05-9b686a07aa21
- Content Type Id: 0x01009E2CD1BE58060F4D85FFD017C8B4A10100B627C45C54BBA148A4B94ADC574CC0D2
- List Name: acLstMain | Id: 1d7b000f-dcd5-440d-ab2d-15da68c2e90b

- To associate the app:
  - If PnP not installed:
    - **Install-Module PnP.PowerShell**
    - **Register-PnPManagementShellAccess**
  - **Connect-PnPOnline -Url https://contoso.sharepoint.com/sites/commssite -Interactive**
  - **$targetList = Get-PnPList -identity "1d7b000f-dcd5-440d-ab2d-15da68c2e90b"**
  - **$targetContentType = get-PnPContentType -List $targetList -Identity "0x01009E2CD1BE58060F4D85FFD017C8B4A10100B627C45C54BBA148A4B94ADC574CC0D2"**
  - **$targetContentType.DisplayFormClientSideComponentId = "05459ba7-ba24-45da-be05-9b686a07aa21"**
  - **$targetContentType.NewFormClientSideComponentId = "05459ba7-ba24-45da-be05-9b686a07aa21"**
  - **$targetContentType.EditFormClientSideComponentId = "05459ba7-ba24-45da-be05-9b686a07aa21"**
  - **$targetContentType.Update($false)**
  - **Invoke-PnPQuery**

## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

- topic 1
- topic 2
- topic 3

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
