## Deploying the app
The steps below will provision Azure resources and deploy the application code to Azure Container Apps.

## Login to your Azure account:
```sh
azd auth login
```

Create a new azd environment:
```sh
azd env new
```

Enter a name that will be used for the resource group. This will create a new folder in the .azure folder, and set it as the active environment for any calls to azd going forward.


Run this single command to provision the resources, deploy the code, and setup integrated vectorization for the sample data:
```sh
azd up
```
Important: Beware that the resources created by this command will incur immediate costs, primarily from the AI Search resource. These resources may accrue costs even if you interrupt the command before it is fully executed. 

You can run ```azd down``` or delete the resources manually to avoid unnecessary spending.

You will be prompted to select two locations, one for the majority of resources and one for the OpenAI resource, which is currently a short list. That location list is based on the OpenAI model availability table and may become outdated as availability changes.

After the application has been successfully deployed you will see a URL printed to the console. Navigate to that URL to interact with the app in your browser.