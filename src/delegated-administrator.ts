import { Construct } from "@aws-cdk/core";
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "@aws-cdk/custom-resources";
import { Account } from "./account";

export interface DelegatedAdministratorProps {
  /**
   * The member account in the organization to register as a delegated administrator.
   */
  readonly account: Account;
  /**
   * The service principal of the AWS service for which you want to make the member account a delegated administrator.
   */
  readonly servicePrincipal: string;
}

/**
 * Enables the specified member account to administer the Organizations features of the specified AWS service. It grants read-only access to AWS Organizations service data. The account still requires IAM permissions to access and administer the AWS service.
 *
 * You can run this action only for AWS services that support this feature. For a current list of services that support it, see the column Supports Delegated Administrator in the table at AWS Services that you can use with AWS Organizations in the AWS Organizations User Guide.
 */
export class DelegatedAdministrator extends Construct {
  public constructor(scope: Construct, id: string, props: DelegatedAdministratorProps) {
    super(scope, id);

    const { account, servicePrincipal } = props;

    new AwsCustomResource(this, "DelegatedAdministratorCustomResource", {
      onCreate: {
        service: "Organizations",
        action: "registerDelegatedAdministrator", // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Organizations.html#registerDelegatedAdministrator-property
        region: "us-east-1",
        physicalResourceId: PhysicalResourceId.of(`${account.accountId}:${servicePrincipal}`),
        parameters: {
          AccountId: account.accountId,
          ServicePrincipal: servicePrincipal,
        },
      },
      onDelete: {
        service: "Organizations",
        action: "registerDelegatedAdministrator", // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Organizations.html#deregisterDelegatedAdministrator-property
        region: "us-east-1",
        parameters: {
          AccountId: account.accountId,
          ServicePrincipal: servicePrincipal,
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
  }
}
