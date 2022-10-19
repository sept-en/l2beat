import { providers } from 'ethers'

import { bytes32ToAddress } from '../../common/address'
import { DiscoveryEngine } from '../../discovery/DiscoveryEngine'
import { ProjectParameters } from '../../types'
import { addresses } from './constants'
import { getEthCrossChainManager } from './contracts/crossChainManager'
import { getLockProxy } from './contracts/lockProxy'
import { getLockProxies, getPolyWrapper } from './contracts/polyWrapper'

export const POLYNETWORK_BRIDGE_NAME = 'polynetworkBridge'

async function getEthCrossChainManagerAddress(
  lockProxy: string,
  provider: providers.Provider,
): Promise<string> {
  // Since `managerProxyContract` is not verified on Etherscan,
  // discovery won't find the manager address itself. We get it manually:
  const proxyContract = bytes32ToAddress(
    await provider.call({ to: lockProxy, data: '0xd798f881' }), // $ cast sig "managerProxyContract()"
  )
  return bytes32ToAddress(
    await provider.call({ to: proxyContract, data: '0x87939a7f' }), // $ cast sig "getEthCrossChainManager()"
  )
}

export async function getPolynetworkBridgeParameters(
  provider: providers.JsonRpcProvider,
): Promise<ProjectParameters> {
  const lockProxies = await getLockProxies(provider)
  const toCall = []
  const fetchedManagers = new Set<string>()
  for (const lockProxy of lockProxies) {
    const ethCrossChainManagerAddress = await getEthCrossChainManagerAddress(
      lockProxy,
      provider,
    )
    // Functions below only push Promises
    toCall.push(getLockProxy(provider, lockProxy, ethCrossChainManagerAddress))
    if (!fetchedManagers.has(ethCrossChainManagerAddress)) {
      toCall.push(
        getEthCrossChainManager(provider, ethCrossChainManagerAddress),
      )
      fetchedManagers.add(ethCrossChainManagerAddress)
    }
  }
  const parameters: ProjectParameters = {
    name: POLYNETWORK_BRIDGE_NAME,
    contracts: await Promise.all([getPolyWrapper(provider), ...toCall]),
  }
  return parameters
}

export async function discoverPolynetworkBridge(
  discoveryEngine: DiscoveryEngine,
) {
  const lockProxies = await getLockProxies(discoveryEngine.provider)
  const managers = await Promise.all(
    lockProxies.map((lockProxy) =>
      getEthCrossChainManagerAddress(lockProxy, discoveryEngine.provider),
    ),
  )
  await discoveryEngine.discover(
    POLYNETWORK_BRIDGE_NAME,
    [addresses.bridge, addresses.lockProxy, ...lockProxies, ...managers],
    {
      skipMethods: {
        [addresses.bridge]: ['lockProxyIndexMap'],
      },
    },
  )
}
