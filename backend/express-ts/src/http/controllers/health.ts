import * as health from '../../core/health'
import { type RequestAdapter, replier } from '../../lib/http-adapter'
import type * as types from '../types'

/**
 * Returns a comprehensive health report intended for monitoring systems and dashboards.
 *
 * The report checks the health of all critical dependencies, including the database,
 * Redis, RabbitMQ, Elasticsearch, and external APIs. This endpoint always responds
 * with HTTP 200 OK. The health of each dependency is reported independently using one
 * of the following statuses:
 *
 * * UP: The dependency is operational and responding within expected performance thresholds.
 * * DEGRADED: The dependency is operational, but performance or functionality is reduced.
 *   The API remains available and core functionality continues to work.
 * * DOWN: The dependency is unavailable or unable to perform its intended function.
 */
export async function healthCheck(req: RequestAdapter) {
  const reply = replier<types.api.health.healthCheck.responses>(req)
  const response = await health.healthCheck()
  return reply.send(200, response)
}

/**
 * Verifies that the application process is running and able to respond to requests.
 *
 * This endpoint performs no I/O or external dependency checks. It returns HTTP 200 OK
 * as long as the process and event loop are responsive.
 */
export async function healthLive(req: RequestAdapter) {
  const reply = replier<types.api.health.healthLive.responses>(req)
  const response = health.isAlive()
  return reply.send(200, response)
}

/**
 * Verifies that the application is ready to receive traffic.
 *
 * This endpoint checks only the critical dependencies required to serve requests,
 * such as the primary database. It returns HTTP 200 OK when the application is ready
 * and HTTP 503 Service Unavailable when it is not, allowing orchestrators or load
 * balancers to temporarily remove the instance from service.
 */
export async function healthReady(req: RequestAdapter) {
  const reply = replier<types.api.health.healthReady.responses>(req)
  const response = await health.isReady()
  return reply.send(response.status === 'DOWN' ? 503 : 200, response)
}
